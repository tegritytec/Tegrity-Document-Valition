import { Finding, RiskBand, Severity } from '../types/tdv';

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  Low: 0.25,
  Medium: 0.50,
  High: 0.75,
  Critical: 1.00
};

export const calculateFindingExpectedLoss = (finding: Finding) => {
  const p = finding.probability;
  const low = Math.round(p * finding.exposureUsd.low);
  const likely = Math.round(p * finding.exposureUsd.likely);
  const high = Math.round(p * finding.exposureUsd.high);
  return { low, likely, high };
};

export const calculateFindingScore = (finding: Finding): number => {
  const wp = 0.30;
  const we = 0.35;
  const ws = 0.25;
  const wq = 0.10;
  const alpha = 0.5;

  const pHat = Math.min(1, Math.max(0, finding.probability));
  
  // Logarithmic scaling of exposure against $2M benchmark
  const exposureBase = finding.exposureUsd.likely;
  const eHat = Math.min(1, Math.log(1 + exposureBase) / Math.log(1 + 2000000));
  
  const sHat = SEVERITY_WEIGHTS[finding.severity] || 0.5;
  const qHat = 0.6; // Mean qualitative impact rating

  const rawScore = 100 * (wp * pHat + we * eHat + ws * sHat + wq * qHat);
  const confidenceMultiplier = Math.pow(Math.min(1, Math.max(0.1, finding.confidence)), alpha);

  return Math.round(Math.min(100, Math.max(0, rawScore * confidenceMultiplier)));
};

export const calculateCaseScoreAndBand = (findings: Finding[]): { caseScore: number; riskBand: RiskBand; totalExpectedLoss: number; reducibleLoss: number } => {
  if (findings.length === 0) {
    return { caseScore: 0, riskBand: 'Low', totalExpectedLoss: 0, reducibleLoss: 0 };
  }

  const activeFindings = findings.filter(f => f.status !== 'Rejected');
  
  if (activeFindings.length === 0) {
    return { caseScore: 0, riskBand: 'Low', totalExpectedLoss: 0, reducibleLoss: 0 };
  }

  const findingScores = activeFindings.map(f => calculateFindingScore(f));
  const maxScore = Math.max(...findingScores, 0);

  // Noisy-OR formula: S_case = 100 * (1 - prod(1 - S_i/100)^beta)
  const beta = 0.5;
  const prodTerm = activeFindings.reduce((acc, f) => {
    const s_i = calculateFindingScore(f);
    return acc * Math.pow(1 - s_i / 100, beta);
  }, 1);

  let noisyOrScore = 100 * (1 - prodTerm);
  let finalScore = Math.max(maxScore, noisyOrScore);

  // Check for unresolved Critical compliance gap -> floor of 75
  const hasUnresolvedCriticalGap = activeFindings.some(
    f => f.severity === 'Critical' && f.type === 'Compliance gap' && f.status === 'Open'
  );

  if (hasUnresolvedCriticalGap) {
    finalScore = Math.max(75, finalScore);
  }

  const caseScore = Math.round(finalScore);

  // Risk band determination
  let riskBand: RiskBand = 'Low';
  if (caseScore >= 75) riskBand = 'Critical';
  else if (caseScore >= 50) riskBand = 'High';
  else if (caseScore >= 25) riskBand = 'Moderate';
  else riskBand = 'Low';

  // Calculate total quantified expected loss & reducible exposure
  let totalExpectedLoss = 0;
  let reducibleLoss = 0;

  activeFindings.forEach(f => {
    const el = calculateFindingExpectedLoss(f).likely;
    totalExpectedLoss += el;
    if (f.status === 'Open' || f.status === 'Modified') {
      // Estimated 75% reduction if recommended action is implemented
      reducibleLoss += Math.round(el * 0.75);
    }
  });

  return { caseScore, riskBand, totalExpectedLoss, reducibleLoss };
};
