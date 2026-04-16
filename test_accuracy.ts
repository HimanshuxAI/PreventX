/**
 * PreventX ML Model Accuracy Test Suite
 * Tests Diabetes, Hypertension, and Anemia models against 30+ clinical test cases.
 * 
 * Run: Open http://localhost:3002/src/test_accuracy.html in the browser
 * or: tsx test_accuracy.ts (requires tsx installed)
 */

import { runPrediction, type FormDataInput, type PredictionResults } from './src/lib/mlEngine';

// ─── Test Case Definition ────────────────────────────────────────────────────────

interface TestCase {
  id: number;
  label: string;
  input: FormDataInput;
  expected: {
    diabetes: 'positive' | 'negative';   // >50% = positive
    hypertension: 'positive' | 'negative';
    anemia: 'positive' | 'negative';
  };
}

function makeInput(overrides: Partial<FormDataInput>): FormDataInput {
  return {
    age: '35', gender: 'Male', height: '170', weight: '70',
    familyDiabetes: 'No', familyHypertension: 'No', familyAnemia: 'No',
    exerciseFrequency: '2-3 times a week', diet: 'Mixed',
    sleep: '7–8 hours (recommended)', alcohol: 'Never', smoking: 'Never',
    stressLevel: 'Low', saltIntake: 'Moderate', sugarIntake: 'Weekly',
    waterIntake: 'Moderate', fattyFood: 'Moderate', junkFood: 'Moderate',
    existingConditions: ['None'], symptoms: [],
    diagSugar: 'No', gestationalDiabetes: 'No',
    heavyBleeding: '', periodDuration: '', homeBP: '',
    fingernailPhoto: null, eyelidPhoto: null, otherCondition: '',
    ...overrides,
  };
}

// ─── 30+ Test Cases ────────────────────────────────────────────────────────────

const testCases: TestCase[] = [
  // ═══ HEALTHY INDIVIDUALS (should all be negative) ═══
  {
    id: 1, label: 'Healthy young male, active lifestyle',
    input: makeInput({ age: '25', gender: 'Male', weight: '68', height: '175',
      exerciseFrequency: 'Daily', stressLevel: 'Low', sleep: '7–8 hours (recommended)',
      sugarIntake: 'Rarely (natural only)', saltIntake: 'Low (minimal added salt)' }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 2, label: 'Healthy young female, balanced diet',
    input: makeInput({ age: '28', gender: 'Female', weight: '58', height: '162',
      exerciseFrequency: '2-3 times a week', diet: 'Vegetarian',
      sugarIntake: 'Rarely (natural only)', saltIntake: 'Low (minimal added salt)' }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 3, label: 'Middle-aged fit male, no history',
    input: makeInput({ age: '42', gender: 'Male', weight: '72', height: '178',
      exerciseFrequency: 'Daily', stressLevel: 'Low' }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 4, label: 'Healthy teen male',
    input: makeInput({ age: '18', gender: 'Male', weight: '62', height: '172',
      exerciseFrequency: 'Daily', stressLevel: 'Low',
      sugarIntake: 'Rarely (natural only)', saltIntake: 'Low (minimal added salt)' }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 5, label: 'Healthy senior, active',
    input: makeInput({ age: '60', gender: 'Male', weight: '74', height: '170',
      exerciseFrequency: 'Daily', stressLevel: 'Low', smoking: 'Never',
      alcohol: 'Never', sugarIntake: 'Rarely (natural only)' }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },

  // ═══ DIABETES POSITIVE CASES ═══
  {
    id: 6, label: 'Classic T2DM: obese, sedentary, family hx, high sugar',
    input: makeInput({ age: '52', gender: 'Male', weight: '105', height: '170',
      familyDiabetes: 'Yes', exerciseFrequency: 'Never', stressLevel: 'High',
      sugarIntake: 'Daily', diet: 'Non-vegetarian',
      symptoms: ['Frequent urination', 'Excessive thirst', 'Unexplained weight loss', 'Blurred vision'],
      diagSugar: 'Yes' }),
    expected: { diabetes: 'positive', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 7, label: 'Pre-diabetic: overweight, family hx',
    input: makeInput({ age: '45', gender: 'Female', weight: '85', height: '160',
      familyDiabetes: 'Yes', exerciseFrequency: 'Rarely',
      sugarIntake: 'Daily', stressLevel: 'Moderate',
      symptoms: ['Fatigue', 'Frequent urination'] }),
    expected: { diabetes: 'positive', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 8, label: 'Gestational diabetes history + obese female',
    input: makeInput({ age: '38', gender: 'Female', weight: '92', height: '158',
      familyDiabetes: 'Yes', gestationalDiabetes: 'Yes',
      sugarIntake: 'Daily', exerciseFrequency: 'Never',
      symptoms: ['Excessive thirst', 'Frequent urination', 'Fatigue'] }),
    expected: { diabetes: 'positive', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 9, label: 'Young obese male with polyphagia',
    input: makeInput({ age: '30', gender: 'Male', weight: '110', height: '175',
      familyDiabetes: 'Yes', sugarIntake: 'Daily', exerciseFrequency: 'Never',
      symptoms: ['Frequent urination', 'Excessive thirst', 'Increased appetite', 'Fatigue'] }),
    expected: { diabetes: 'positive', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 10, label: 'Diabetic senior with neuropathy symptoms',
    input: makeInput({ age: '65', gender: 'Male', weight: '95', height: '168',
      familyDiabetes: 'Yes', diagSugar: 'Yes', exerciseFrequency: 'Never',
      sugarIntake: 'Daily', stressLevel: 'High',
      symptoms: ['Numbness/tingling', 'Blurred vision', 'Frequent urination', 'Slow wound healing', 'Fatigue'] }),
    expected: { diabetes: 'positive', hypertension: 'negative', anemia: 'negative' }
  },

  // ═══ HYPERTENSION POSITIVE CASES ═══
  {
    id: 11, label: 'Classic HTN: high salt, smoker, stressed, family hx',
    input: makeInput({ age: '55', gender: 'Male', weight: '88', height: '172',
      familyHypertension: 'Yes', smoking: 'Yes, regularly', stressLevel: 'High',
      saltIntake: 'High', sleep: 'Less than 5 hours', exerciseFrequency: 'Never',
      symptoms: ['Headaches', 'Dizziness'], homeBP: '150/95' }),
    expected: { diabetes: 'negative', hypertension: 'positive', anemia: 'negative' }
  },
  {
    id: 12, label: 'Hypertensive obese female',
    input: makeInput({ age: '50', gender: 'Female', weight: '95', height: '160',
      familyHypertension: 'Yes', stressLevel: 'High', saltIntake: 'High',
      exerciseFrequency: 'Never', sleep: '5–6 hours',
      symptoms: ['Headaches', 'Shortness of breath'], homeBP: '145/90' }),
    expected: { diabetes: 'negative', hypertension: 'positive', anemia: 'negative' }
  },
  {
    id: 13, label: 'Smoker with high salt diet, no exercise',
    input: makeInput({ age: '48', gender: 'Male', weight: '82', height: '170',
      smoking: 'Yes, regularly', alcohol: 'Frequently', saltIntake: 'High',
      stressLevel: 'High', exerciseFrequency: 'Never', sleep: 'Less than 5 hours',
      familyHypertension: 'Yes', homeBP: '155/100' }),
    expected: { diabetes: 'negative', hypertension: 'positive', anemia: 'negative' }
  },
  {
    id: 14, label: 'Elderly with known BP and kidney issues',
    input: makeInput({ age: '70', gender: 'Male', weight: '80', height: '168',
      familyHypertension: 'Yes', stressLevel: 'High', saltIntake: 'High',
      existingConditions: ['Kidney disease'], smoking: 'Yes, regularly',
      symptoms: ['Headaches', 'Chest pain'], homeBP: '160/100' }),
    expected: { diabetes: 'negative', hypertension: 'positive', anemia: 'negative' }
  },
  {
    id: 15, label: 'Stressed corporate worker with poor sleep',
    input: makeInput({ age: '40', gender: 'Male', weight: '85', height: '175',
      stressLevel: 'High', sleep: 'Less than 5 hours', saltIntake: 'High',
      exerciseFrequency: 'Never', familyHypertension: 'Yes',
      smoking: 'Occasionally', homeBP: '140/92' }),
    expected: { diabetes: 'negative', hypertension: 'positive', anemia: 'negative' }
  },

  // ═══ ANEMIA POSITIVE CASES ═══
  {
    id: 16, label: 'Iron-deficient vegetarian female with heavy periods',
    input: makeInput({ age: '28', gender: 'Female', weight: '48', height: '158',
      diet: 'Vegetarian', familyAnemia: 'Yes',
      heavyBleeding: 'Yes, regularly', periodDuration: '7+ days',
      symptoms: ['Fatigue', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands/feet'] }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'positive' }
  },
  {
    id: 17, label: 'Anemic teen female, poor diet',
    input: makeInput({ age: '16', gender: 'Female', weight: '42', height: '155',
      diet: 'Vegetarian', familyAnemia: 'Yes',
      heavyBleeding: 'Yes, regularly', periodDuration: '7+ days',
      symptoms: ['Fatigue', 'Pale skin', 'Hair loss', 'Brittle nails', 'Dizziness'] }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'positive' }
  },
  {
    id: 18, label: 'Pregnant woman with anemia symptoms',
    input: makeInput({ age: '30', gender: 'Female', weight: '55', height: '160',
      familyAnemia: 'Yes', diet: 'Vegetarian',
      symptoms: ['Fatigue', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Pica (craving non-food items)'] }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'positive' }
  },
  {
    id: 19, label: 'Elderly male with chronic fatigue and pallor',
    input: makeInput({ age: '72', gender: 'Male', weight: '60', height: '165',
      familyAnemia: 'Yes',
      symptoms: ['Fatigue', 'Pale skin', 'Shortness of breath', 'Cold hands/feet', 'Chest pain'] }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'positive' }
  },
  {
    id: 20, label: 'Young female with pica and hair loss',
    input: makeInput({ age: '22', gender: 'Female', weight: '45', height: '157',
      diet: 'Vegetarian', familyAnemia: 'Yes',
      heavyBleeding: 'Yes, occasionally', periodDuration: '5-7 days',
      symptoms: ['Fatigue', 'Pale skin', 'Hair loss', 'Pica (craving non-food items)', 'Brittle nails'] }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'positive' }
  },

  // ═══ COMORBID CASES (Multiple conditions) ═══
  {
    id: 21, label: 'Metabolic syndrome: DM + HTN',
    input: makeInput({ age: '58', gender: 'Male', weight: '100', height: '172',
      familyDiabetes: 'Yes', familyHypertension: 'Yes',
      exerciseFrequency: 'Never', stressLevel: 'High',
      sugarIntake: 'Daily', saltIntake: 'High', smoking: 'Yes, regularly',
      sleep: 'Less than 5 hours', diagSugar: 'Yes', homeBP: '150/95',
      symptoms: ['Frequent urination', 'Excessive thirst', 'Headaches', 'Fatigue'] }),
    expected: { diabetes: 'positive', hypertension: 'positive', anemia: 'negative' }
  },
  {
    id: 22, label: 'Anemic + diabetic female',
    input: makeInput({ age: '45', gender: 'Female', weight: '88', height: '158',
      familyDiabetes: 'Yes', familyAnemia: 'Yes', diet: 'Vegetarian',
      sugarIntake: 'Daily', exerciseFrequency: 'Never',
      heavyBleeding: 'Yes, regularly', periodDuration: '7+ days',
      symptoms: ['Fatigue', 'Pale skin', 'Frequent urination', 'Excessive thirst', 'Dizziness'] }),
    expected: { diabetes: 'positive', hypertension: 'negative', anemia: 'positive' }
  },
  {
    id: 23, label: 'Triple comorbid: elderly obese smoker',
    input: makeInput({ age: '65', gender: 'Male', weight: '105', height: '170',
      familyDiabetes: 'Yes', familyHypertension: 'Yes', familyAnemia: 'Yes',
      exerciseFrequency: 'Never', stressLevel: 'High', smoking: 'Yes, regularly',
      alcohol: 'Frequently', sugarIntake: 'Daily', saltIntake: 'High',
      sleep: 'Less than 5 hours', diagSugar: 'Yes', homeBP: '160/100',
      symptoms: ['Fatigue', 'Pale skin', 'Frequent urination', 'Headaches', 'Shortness of breath', 'Chest pain'] }),
    expected: { diabetes: 'positive', hypertension: 'positive', anemia: 'positive' }
  },

  // ═══ EDGE CASES / BORDERLINE ═══
  {
    id: 24, label: 'Slightly overweight, moderate risk factors',
    input: makeInput({ age: '40', gender: 'Male', weight: '82', height: '172',
      exerciseFrequency: 'Rarely', stressLevel: 'Moderate',
      sugarIntake: 'Weekly', saltIntake: 'Moderate' }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 25, label: 'Thin female with mild fatigue only',
    input: makeInput({ age: '30', gender: 'Female', weight: '50', height: '160',
      symptoms: ['Fatigue'] }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 26, label: 'Obese but young, no other risk factors',
    input: makeInput({ age: '22', gender: 'Male', weight: '100', height: '178',
      exerciseFrequency: '2-3 times a week', stressLevel: 'Low' }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 27, label: 'Elderly female, minimal symptoms, non-smoker',
    input: makeInput({ age: '68', gender: 'Female', weight: '65', height: '155',
      exerciseFrequency: '2-3 times a week', stressLevel: 'Low',
      sugarIntake: 'Rarely (natural only)', saltIntake: 'Low (minimal added salt)' }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },

  // ═══ MORE POSITIVE CASES TO REACH 30+ ═══
  {
    id: 28, label: 'Diabetic with polyuria + polydipsia + weight loss',
    input: makeInput({ age: '50', gender: 'Male', weight: '78', height: '170',
      familyDiabetes: 'Yes', sugarIntake: 'Daily', exerciseFrequency: 'Never',
      symptoms: ['Frequent urination', 'Excessive thirst', 'Unexplained weight loss', 'Increased appetite', 'Fatigue'] }),
    expected: { diabetes: 'positive', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 29, label: 'Hypertensive with chest pain and breathlessness',
    input: makeInput({ age: '55', gender: 'Male', weight: '90', height: '175',
      familyHypertension: 'Yes', smoking: 'Yes, regularly', saltIntake: 'High',
      stressLevel: 'High', sleep: 'Less than 5 hours', exerciseFrequency: 'Never',
      symptoms: ['Chest pain', 'Shortness of breath', 'Headaches'], homeBP: '165/105' }),
    expected: { diabetes: 'negative', hypertension: 'positive', anemia: 'negative' }
  },
  {
    id: 30, label: 'Severely anemic female post-partum',
    input: makeInput({ age: '26', gender: 'Female', weight: '46', height: '155',
      familyAnemia: 'Yes', diet: 'Vegetarian',
      heavyBleeding: 'Yes, regularly', periodDuration: '7+ days',
      symptoms: ['Fatigue', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands/feet', 'Hair loss'] }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'positive' }
  },
  {
    id: 31, label: 'Healthy male athlete',
    input: makeInput({ age: '24', gender: 'Male', weight: '75', height: '182',
      exerciseFrequency: 'Daily', stressLevel: 'Low', smoking: 'Never',
      alcohol: 'Never', sugarIntake: 'Rarely (natural only)',
      saltIntake: 'Low (minimal added salt)', sleep: '7–8 hours (recommended)' }),
    expected: { diabetes: 'negative', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 32, label: 'Morbidly obese with all DM symptoms',
    input: makeInput({ age: '48', gender: 'Female', weight: '120', height: '162',
      familyDiabetes: 'Yes', diagSugar: 'Yes', gestationalDiabetes: 'Yes',
      sugarIntake: 'Daily', exerciseFrequency: 'Never', stressLevel: 'High',
      symptoms: ['Frequent urination', 'Excessive thirst', 'Blurred vision', 'Slow wound healing', 'Numbness/tingling', 'Fatigue'] }),
    expected: { diabetes: 'positive', hypertension: 'negative', anemia: 'negative' }
  },
  {
    id: 33, label: 'HTN + heavy drinker/smoker',
    input: makeInput({ age: '52', gender: 'Male', weight: '85', height: '170',
      familyHypertension: 'Yes', smoking: 'Yes, regularly', alcohol: 'Frequently',
      saltIntake: 'High', stressLevel: 'High', exerciseFrequency: 'Never',
      sleep: 'Less than 5 hours', homeBP: '155/98',
      existingConditions: ['High blood pressure'],
      symptoms: ['Headaches', 'Dizziness'] }),
    expected: { diabetes: 'negative', hypertension: 'positive', anemia: 'negative' }
  },
];

// ─── Run Tests ───────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         PreventX ML Model Accuracy Test Suite                   ║');
  console.log('║         Testing 33 clinical cases across 3 models               ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  const results: {
    id: number;
    label: string;
    diabetesPred: number;
    diabetesExpected: string;
    diabetesPass: boolean;
    hyperPred: number;
    hyperExpected: string;
    hyperPass: boolean;
    anemiaPred: number;
    anemiaExpected: string;
    anemiaPass: boolean;
  }[] = [];

  let diabetesCorrect = 0, hyperCorrect = 0, anemiaCorrect = 0;
  const total = testCases.length;

  for (const tc of testCases) {
    const pred = await runPrediction(tc.input);
    
    const dRisk = pred.diabetes.risk;
    const hRisk = pred.hypertension.risk;
    const aRisk = pred.anemia.risk;

    const dPass = (tc.expected.diabetes === 'positive' && dRisk > 50) ||
                  (tc.expected.diabetes === 'negative' && dRisk <= 50);
    const hPass = (tc.expected.hypertension === 'positive' && hRisk > 50) ||
                  (tc.expected.hypertension === 'negative' && hRisk <= 50);
    const aPass = (tc.expected.anemia === 'positive' && aRisk > 50) ||
                  (tc.expected.anemia === 'negative' && aRisk <= 50);

    if (dPass) diabetesCorrect++;
    if (hPass) hyperCorrect++;
    if (aPass) anemiaCorrect++;

    results.push({
      id: tc.id, label: tc.label,
      diabetesPred: dRisk, diabetesExpected: tc.expected.diabetes, diabetesPass: dPass,
      hyperPred: hRisk, hyperExpected: tc.expected.hypertension, hyperPass: hPass,
      anemiaPred: aRisk, anemiaExpected: tc.expected.anemia, anemiaPass: aPass,
    });

    const dIcon = dPass ? '✅' : '❌';
    const hIcon = hPass ? '✅' : '❌';
    const aIcon = aPass ? '✅' : '❌';
    console.log(`#${String(tc.id).padStart(2, '0')} ${tc.label}`);
    console.log(`    ${dIcon} DM: ${dRisk}% (exp: ${tc.expected.diabetes})  ${hIcon} HTN: ${hRisk}% (exp: ${tc.expected.hypertension})  ${aIcon} AN: ${aRisk}% (exp: ${tc.expected.anemia})`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('                     ACCURACY REPORT');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  Diabetes:      ${diabetesCorrect}/${total} correct = ${((diabetesCorrect / total) * 100).toFixed(1)}%`);
  console.log(`  Hypertension:  ${hyperCorrect}/${total} correct = ${((hyperCorrect / total) * 100).toFixed(1)}%`);
  console.log(`  Anemia:        ${anemiaCorrect}/${total} correct = ${((anemiaCorrect / total) * 100).toFixed(1)}%`);
  const overall = ((diabetesCorrect + hyperCorrect + anemiaCorrect) / (total * 3) * 100).toFixed(1);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Overall:       ${overall}% (${diabetesCorrect + hyperCorrect + anemiaCorrect}/${total * 3})`);
  console.log('═══════════════════════════════════════════════════════════════════');

  // Print failures
  const failures = results.filter(r => !r.diabetesPass || !r.hyperPass || !r.anemiaPass);
  if (failures.length > 0) {
    console.log(`\n⚠️  ${failures.length} test case(s) had at least one failure:`);
    failures.forEach(f => {
      const issues: string[] = [];
      if (!f.diabetesPass) issues.push(`DM: got ${f.diabetesPred}% exp ${f.diabetesExpected}`);
      if (!f.hyperPass) issues.push(`HTN: got ${f.hyperPred}% exp ${f.hyperExpected}`);
      if (!f.anemiaPass) issues.push(`AN: got ${f.anemiaPred}% exp ${f.anemiaExpected}`);
      console.log(`  #${f.id} ${f.label}: ${issues.join(', ')}`);
    });
  }

  return { diabetesCorrect, hyperCorrect, anemiaCorrect, total, overall };
}

// Export for browser use
(window as any).runAccuracyTests = runTests;
runTests();
