import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Users, 
  Activity, 
  Utensils, 
  Stethoscope, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Info,
  ArrowRight,
  Heart,
  Droplets,
  Zap,
  Clock,
  Loader2,
  FileText,
  Share2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, translations } from '../types';
import { runPrediction, type FormDataInput, type PredictionResults } from '../lib/mlEngine';
import { ResultsDashboard } from './ResultsDashboard';

interface PredictorProps {
  onClose: () => void;
  language: Language;
  initialDisease?: string;
}

interface RadioCardProps {
  key?: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  description?: string;
  isMissing?: boolean;
}

function RadioCard({ label, selected, onClick, description, isMissing }: RadioCardProps) {
  return (
  <button 
    onClick={onClick}
    className={cn(
      "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 group mb-2 text-wrap",
      selected 
        ? "border-amber-400 bg-amber-50/50" 
        : cn(
            "border-slate-100 bg-white hover:border-slate-200",
            isMissing && "border-rose-500 bg-rose-50/30"
          )
    )}
  >
    <div className={cn(
      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
      selected ? "border-amber-500 bg-white" : "border-slate-200 group-hover:border-slate-300"
    )}>
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
    </div>
    <div>
      <p className={cn("text-sm font-bold transition-colors", selected ? "text-amber-900" : "text-slate-700 group-hover:text-slate-900")}>{label}</p>
      {description && <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>}
    </div>
  </button>
  );
}

export function DiseasePredictor({ onClose, language, initialDisease }: PredictorProps) {
  const t = translations[language];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    // Section 1: Basic Info
    age: '',
    gender: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    waist: '',
    
    // Section 2: Family History
    parentsDiabetes: '',
    relativesBP: '',
    familyAnemia: '',
    familyAnemiaPregnancy: '',
    
    // Section 3: Lifestyle
    smoke: '',
    alcohol: '',
    activity: '',
    sleep: '',
    stress: '',
    
    // Section 4: Diet
    fruitsVeg: '',
    sugaryFoods: '',
    saltyFoods: '',
    ironRichFoods: '',
    dietType: '',
    supplements: '',
    
    // Section 5: Medical History
    diagBP: '',
    diagSugar: '',
    gestationalDiabetes: '',
    heavyBleeding: '',
    periodDuration: '',
    existingConditions: [],
    otherCondition: '',
    
    // Section 6: Symptoms
    symptoms: [],

    // Section 7: Quick Camera Check & Longitudinal
    weightChange: '',
    sittingHours: '',
    hungerIncrease: '',
    fingernailPhoto: null,
    eyelidPhoto: null,
    homeBP: ''
  });

  const [results, setResults] = useState<PredictionResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const totalSteps = 7;
  const progress = Math.round((step / totalSteps) * 100);

  // BMI Calculation
  const bmi = useMemo(() => {
    if (!formData.weight || !formData.heightFeet) return null;
    const heightInInches = (parseInt(formData.heightFeet) * 12) + (parseInt(formData.heightInches) || 0);
    const heightInMeters = heightInInches * 0.0254;
    if (heightInMeters === 0) return null;
    return (parseFloat(formData.weight) / (heightInMeters * heightInMeters)).toFixed(1);
  }, [formData.weight, formData.heightFeet, formData.heightInches]);

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.age && formData.gender && formData.heightFeet && formData.heightInches !== '' && formData.weight && formData.waist;
      case 2:
        return formData.parentsDiabetes && formData.relativesBP && formData.familyAnemia && (formData.gender === 'Female' ? formData.familyAnemiaPregnancy : true);
      case 3:
        return formData.smoke && formData.alcohol && formData.activity && formData.sleep && formData.stress && 
               formData.weightChange && formData.sittingHours && formData.hungerIncrease;
      case 4:
        return formData.fruitsVeg && formData.sugaryFoods && formData.saltyFoods && formData.ironRichFoods && formData.dietType && formData.supplements;
      case 5:
        const isOtherSelected = formData.existingConditions.includes('Other');
        return formData.diagBP && formData.diagSugar && 
               (formData.gender === 'Female' ? (formData.gestationalDiabetes && formData.heavyBleeding && formData.periodDuration) : true) && 
               formData.existingConditions.length > 0 &&
               (isOtherSelected ? formData.otherCondition.trim() !== '' : true);
      case 6:
        return formData.symptoms.length > 0;
      case 7:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isStepValid()) {
      setShowValidationErrors(true);
      alert('Please fill all the required questions asked before proceeding.');
      return;
    }
    setShowValidationErrors(false);
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      calculateRisk();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const calculateRisk = () => {
    setIsCalculating(true);
    // Simulate ML model processing time (ensemble inference)
    setTimeout(() => {
      // Map form data to ML engine format
      const heightCm = ((parseInt(formData.heightFeet) || 5) * 12 + (parseInt(formData.heightInches) || 0)) * 2.54;
      const mlInput: FormDataInput = {
        age: formData.age || '30',
        gender: formData.gender || 'Male',
        height: String(Math.round(heightCm)),
        weight: formData.weight || '70',
        familyDiabetes: formData.parentsDiabetes === 'Both parents' ? 'Yes' : formData.parentsDiabetes === 'One parent' ? 'Yes' : 'No',
        familyHypertension: formData.relativesBP || 'No',
        familyAnemia: formData.familyAnemia || 'No',
        exerciseFrequency: formData.activity === 'Sedentary' ? 'Never' : formData.activity === 'Moderate' ? '2-3 times a week' : formData.activity === 'Active' ? 'Daily' : 'Rarely',
        diet: formData.dietType || 'Mixed',
        sleep: formData.sleep === 'Under 5 hours' ? 'Less than 5 hours' : formData.sleep === '5-6 hours' ? '5\u20136 hours' : '7\u20138 hours (recommended)',
        alcohol: formData.alcohol === 'Frequently' ? 'Frequently' : formData.alcohol === 'Occasionally' ? 'Occasionally' : 'Never',
        smoking: formData.smoke === 'Currently' ? 'Yes, regularly' : formData.smoke === 'Ex-smoker' ? 'Occasionally' : 'Never',
        stressLevel: formData.stress || 'Moderate',
        saltIntake: formData.saltyFoods === 'Daily' ? 'High' : formData.saltyFoods === 'Weekly' ? 'Moderate' : 'Low',
        sugarIntake: formData.sugaryFoods === 'Daily' ? 'Daily' : formData.sugaryFoods === 'Weekly' ? 'Weekly' : 'Rarely (natural only)',
        waterIntake: 'Moderate',
        fattyFood: 'Moderate',
        junkFood: 'Moderate',
        existingConditions: formData.existingConditions || [],
        symptoms: formData.symptoms || [],
        diagSugar: formData.diagSugar || 'No',
        gestationalDiabetes: formData.gestationalDiabetes || 'No',
        heavyBleeding: formData.heavyBleeding || '',
        periodDuration: formData.periodDuration || '',
        homeBP: formData.homeBP || '',
        fingernailPhoto: formData.fingernailPhoto,
        eyelidPhoto: formData.eyelidPhoto,
        otherCondition: formData.otherCondition || '',
      };
      runPrediction(mlInput).then(predictionResults => {
        setResults(predictionResults);
        setIsCalculating(false);
      }).catch(err => {
        console.error("Prediction failed:", err);
        setIsCalculating(false);
      });
    }, 1500);
  };

  const isMissing = (field: string) => {
    if (!showValidationErrors) return false;
    const value = formData[field];
    if (Array.isArray(value)) return value.length === 0;
    return !value;
  };

  const StepHeader = ({ icon: Icon, title, badge }: { icon: any, title: string, badge?: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-display font-bold text-slate-900 tracking-tight">{title}</h3>
      {badge && (
        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ml-1">
          {badge}
        </span>
      )}
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <StepHeader icon={User} title="SECTION 1: Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">What is your age? (in years)</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => {
                    setFormData({...formData, age: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  placeholder="e.g. 25"
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all",
                    isMissing('age') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">What is your gender?</label>
                <div className={cn(
                  "flex gap-2 p-1 rounded-xl transition-all",
                  isMissing('gender') && "bg-rose-50 ring-2 ring-rose-500"
                )}>
                  {['Male', 'Female'].map(g => (
                    <button 
                      key={g}
                      onClick={() => {
                        setFormData({...formData, gender: g});
                        if (showValidationErrors) setShowValidationErrors(false);
                      }}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all",
                        formData.gender === g 
                          ? "border-blue-600 bg-blue-50 text-blue-600" 
                          : "border-slate-100 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">What is your height? (feet & inches)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Ft"
                    value={formData.heightFeet}
                    onChange={(e) => {
                      setFormData({...formData, heightFeet: e.target.value});
                      if (showValidationErrors) setShowValidationErrors(false);
                    }}
                    className={cn(
                      "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                      isMissing('heightFeet') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                    )}
                  />
                  <input 
                    type="number" 
                    placeholder="In"
                    value={formData.heightInches}
                    onChange={(e) => {
                      setFormData({...formData, heightInches: e.target.value});
                      if (showValidationErrors) setShowValidationErrors(false);
                    }}
                    className={cn(
                      "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                      isMissing('heightInches') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">What is your current weight? (in kg)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 70"
                  value={formData.weight}
                  onChange={(e) => {
                    setFormData({...formData, weight: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('weight') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide block">
                  What is your waist circumference?
                  <span className="block text-[10px] text-slate-400 font-medium mt-0.5 normal-case">(Measure at navel level while standing)</span>
                </label>
                <input 
                  type="number" 
                  placeholder="Enter value in cm"
                  value={formData.waist}
                  onChange={(e) => {
                    setFormData({...formData, waist: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('waist') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                />
              </div>
            </div>
            {bmi && (
              <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Activity className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-blue-900 block">Live BMI Calculation</span>
                    <span className="text-xs text-blue-600 font-bold uppercase tracking-widest">Automatic Update</span>
                  </div>
                </div>
                <span className="text-4xl font-display font-bold text-blue-600">{bmi}</span>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <StepHeader icon={Users} title="SECTION 2: Family History" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">Do either of your parents have diabetes?</label>
                <select 
                  value={formData.parentsDiabetes}
                  onChange={(e) => {
                    setFormData({...formData, parentsDiabetes: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('parentsDiabetes') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                >
                  <option value="">Select Option</option>
                  <option>No</option>
                  <option>One parent</option>
                  <option>Both parents</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">Do any close relatives have high blood pressure?</label>
                <select 
                  value={formData.relativesBP}
                  onChange={(e) => {
                    setFormData({...formData, relativesBP: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('relativesBP') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                >
                  <option value="">Select Option</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">Is there any family history of anemia or blood disorders?</label>
                <select 
                  value={formData.familyAnemia}
                  onChange={(e) => {
                    setFormData({...formData, familyAnemia: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('familyAnemia') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                >
                  <option value="">Select Option</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
              {formData.gender === 'Female' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">Family history of anemia during pregnancy or heavy periods?</label>
                  <select 
                    value={formData.familyAnemiaPregnancy}
                    onChange={(e) => {
                      setFormData({...formData, familyAnemiaPregnancy: e.target.value});
                      if (showValidationErrors) setShowValidationErrors(false);
                    }}
                    className={cn(
                      "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                      isMissing('familyAnemiaPregnancy') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                    )}
                  >
                    <option value="">Select Option</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            <StepHeader icon={Activity} title="Lifestyle & Habits" />
            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-[24px] border transition-all",
                isMissing('activity') ? "border-rose-500 bg-rose-50/20" : "bg-slate-50/50 border-slate-100"
              )}>
                <p className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  Physical activity level <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">IDRS Core</span>
                </p>
                <div className="space-y-1">
                  {[
                    'Vigorous exercise + strenuous work',
                    'Regular exercise or strenuous work',
                    'Mild exercise at work/home',
                    'No exercise + sedentary work'
                  ].map(opt => (
                    <RadioCard 
                      key={opt}
                      label={opt}
                      selected={formData.activity === opt}
                      onClick={() => {
                        setFormData({...formData, activity: opt});
                        if (showValidationErrors) setShowValidationErrors(false);
                      }}
                      isMissing={isMissing('activity')}
                    />
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">Smoking</label>
                  <select 
                    value={formData.smoke}
                    onChange={(e) => {
                      setFormData({...formData, smoke: e.target.value});
                      if (showValidationErrors) setShowValidationErrors(false);
                    }}
                    className={cn(
                      "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                      isMissing('smoke') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                    )}
                  >
                    <option value="">Select Option</option>
                    <option>Never</option>
                    <option>Previously (used to smoke)</option>
                    <option>Currently</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">Alcohol</label>
                  <select 
                    value={formData.alcohol}
                    onChange={(e) => {
                      setFormData({...formData, alcohol: e.target.value});
                      if (showValidationErrors) setShowValidationErrors(false);
                    }}
                    className={cn(
                      "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                      isMissing('alcohol') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                    )}
                  >
                    <option value="">Select Option</option>
                    <option>Never</option>
                    <option>Occasionally (1–2 times per week)</option>
                    <option>Frequently (3–5 times per week)</option>
                    <option>Daily</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">Average sleep</label>
                  <select 
                    value={formData.sleep}
                    onChange={(e) => {
                      setFormData({...formData, sleep: e.target.value});
                      if (showValidationErrors) setShowValidationErrors(false);
                    }}
                    className={cn(
                      "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                      isMissing('sleep') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                    )}
                  >
                    <option value="">Select Option</option>
                    <option>Less than 4 hours</option>
                    <option>4–5 hours</option>
                    <option>5–6 hours</option>
                    <option>7–8 hours</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">Daily stress level</label>
                  <select 
                    value={formData.stress}
                    onChange={(e) => {
                      setFormData({...formData, stress: e.target.value});
                      if (showValidationErrors) setShowValidationErrors(false);
                    }}
                    className={cn(
                      "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                      isMissing('stress') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                    )}
                  >
                    <option value="">Select Option</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-6">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Longitudinal Health Tracking</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Has your weight changed more than 5 kg in last 6 months?</label>
                    <select 
                      value={formData.weightChange}
                      onChange={(e) => {
                        setFormData({...formData, weightChange: e.target.value});
                        if (showValidationErrors) setShowValidationErrors(false);
                      }}
                      className={cn(
                        "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                        isMissing('weightChange') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                      )}
                    >
                      <option value="">Select Option</option>
                      <option>Weight Gain</option>
                      <option>Weight Loss</option>
                      <option>No Significant Change</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">How many hours per day do you spend sitting?</label>
                    <input 
                      type="number"
                      value={formData.sittingHours}
                      onChange={(e) => {
                        setFormData({...formData, sittingHours: e.target.value});
                        if (showValidationErrors) setShowValidationErrors(false);
                      }}
                      placeholder="e.g. 8"
                      className={cn(
                        "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                        isMissing('sittingHours') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                      )}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Any recent increase in hunger or unexplained weight loss?</label>
                    <div className={cn(
                      "flex gap-2 p-1 rounded-xl transition-all",
                      isMissing('hungerIncrease') && "bg-rose-50 ring-2 ring-rose-500"
                    )}>
                      {['Yes', 'No'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => {
                            setFormData({...formData, hungerIncrease: opt});
                            if (showValidationErrors) setShowValidationErrors(false);
                          }}
                          className={cn(
                            "flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all",
                            formData.hungerIncrease === opt 
                              ? "border-blue-600 bg-blue-50 text-blue-600" 
                              : "border-slate-100 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8">
            <StepHeader icon={Utensils} title="SECTION 4: Diet Patterns" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">How often do you consume fruits and vegetables?</label>
                <select 
                  value={formData.fruitsVeg}
                  onChange={(e) => {
                    setFormData({...formData, fruitsVeg: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('fruitsVeg') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                >
                  <option value="">Select Option</option>
                  <option>Daily</option>
                  <option>4–6 days per week</option>
                  <option>2–3 days per week</option>
                  <option>Rarely</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">How often do you consume sugary foods or drinks?</label>
                <select 
                  value={formData.sugaryFoods}
                  onChange={(e) => {
                    setFormData({...formData, sugaryFoods: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('sugaryFoods') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                >
                  <option value="">Select Option</option>
                  <option>Daily</option>
                  <option>Often</option>
                  <option>Rarely</option>
                  <option>Never</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">How often do you consume salty or processed foods?</label>
                <select 
                  value={formData.saltyFoods}
                  onChange={(e) => {
                    setFormData({...formData, saltyFoods: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('saltyFoods') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                >
                  <option value="">Select Option</option>
                  <option>Rarely</option>
                  <option>Occasionally</option>
                  <option>Frequently</option>
                  <option>Daily</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">How often do you consume iron-rich foods?</label>
                <select 
                  value={formData.ironRichFoods}
                  onChange={(e) => {
                    setFormData({...formData, ironRichFoods: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('ironRichFoods') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                >
                  <option value="">Select Option</option>
                  <option>Daily</option>
                  <option>4–6 days per week</option>
                  <option>2–3 days per week</option>
                  <option>Rarely</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">What type of diet do you follow?</label>
                <select 
                  value={formData.dietType}
                  onChange={(e) => {
                    setFormData({...formData, dietType: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('dietType') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                >
                  <option value="">Select Option</option>
                  <option>Vegetarian</option>
                  <option>Eggetarian</option>
                  <option>Non-vegetarian</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">Do you take iron supplements or multivitamins?</label>
                <select 
                  value={formData.supplements}
                  onChange={(e) => {
                    setFormData({...formData, supplements: e.target.value});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                    isMissing('supplements') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                  )}
                >
                  <option value="">Select Option</option>
                  <option>No</option>
                  <option>Occasionally</option>
                  <option>Regularly</option>
                  <option>Daily</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8">
            <StepHeader icon={Stethoscope} title="SECTION 5: Medical History" />
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">Have you ever been diagnosed with high blood pressure?</label>
                  <select 
                    value={formData.diagBP}
                    onChange={(e) => {
                      setFormData({...formData, diagBP: e.target.value});
                      if (showValidationErrors) setShowValidationErrors(false);
                    }}
                    className={cn(
                      "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                      isMissing('diagBP') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                    )}
                  >
                    <option value="">Select Option</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 tracking-wide">Have you ever had high blood sugar levels?</label>
                  <select 
                    value={formData.diagSugar}
                    onChange={(e) => {
                      setFormData({...formData, diagSugar: e.target.value});
                      if (showValidationErrors) setShowValidationErrors(false);
                    }}
                    className={cn(
                      "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                      isMissing('diagSugar') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                    )}
                  >
                    <option value="">Select Option</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>

              {formData.gender === 'Female' && (
                <div className={cn(
                  "space-y-6 p-6 rounded-[32px] border transition-all",
                  (isMissing('gestationalDiabetes') || isMissing('heavyBleeding') || isMissing('periodDuration')) 
                    ? "border-rose-500 bg-rose-50/20" 
                    : "bg-blue-50/30 border-blue-100/50"
                )}>
                  <h4 className="font-bold text-blue-800 uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5" /> Women's health section
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">History of gestational diabetes?</label>
                      <select 
                        value={formData.gestationalDiabetes}
                        onChange={(e) => {
                          setFormData({...formData, gestationalDiabetes: e.target.value});
                          if (showValidationErrors) setShowValidationErrors(false);
                        }}
                        className={cn(
                          "w-full bg-white border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                          isMissing('gestationalDiabetes') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                        )}
                      >
                        <option value="">Select Option</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Heavy or frequent menstrual bleeding?</label>
                      <select 
                        value={formData.heavyBleeding}
                        onChange={(e) => {
                          setFormData({...formData, heavyBleeding: e.target.value});
                          if (showValidationErrors) setShowValidationErrors(false);
                        }}
                        className={cn(
                          "w-full bg-white border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                          isMissing('heavyBleeding') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                        )}
                      >
                        <option value="">Select Option</option>
                        <option>No, normal flow</option>
                        <option>Sometimes heavier than usual</option>
                        <option>Often heavy (need to change pad/tampon every 2–3 hours)</option>
                        <option>Very heavy (need to change every 1–2 hours or frequent leakage)</option>
                        <option>Not sure</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">How long does your period usually last?</label>
                      <select 
                        value={formData.periodDuration}
                        onChange={(e) => {
                          setFormData({...formData, periodDuration: e.target.value});
                          if (showValidationErrors) setShowValidationErrors(false);
                        }}
                        className={cn(
                          "w-full bg-white border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium",
                          isMissing('periodDuration') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                        )}
                      >
                        <option value="">Select Option</option>
                        <option>2–3 days</option>
                        <option>4–5 days (normal)</option>
                        <option>6–7 days</option>
                        <option>More than 7 days</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 tracking-wide">Do you have any existing medical conditions?</label>
                <div className={cn(
                  "grid grid-cols-2 sm:grid-cols-3 gap-2 p-1 rounded-xl transition-all",
                  isMissing('existingConditions') && "bg-rose-50 ring-2 ring-rose-500"
                )}>
                  {['Thyroid disorder', 'Kidney issues', 'Digestive problems', 'None', 'Other'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => {
                        const current = formData.existingConditions;
                        let next;
                        if (opt === 'None') {
                          next = ['None'];
                        } else {
                          next = current.includes(opt) 
                            ? current.filter((i: string) => i !== opt)
                            : [...current.filter((i: string) => i !== 'None'), opt];
                        }
                        setFormData({...formData, existingConditions: next});
                        if (showValidationErrors) setShowValidationErrors(false);
                      }}
                      className={cn(
                        "py-3 px-3 rounded-xl text-xs font-bold border-2 transition-all",
                        formData.existingConditions.includes(opt) 
                          ? "border-blue-600 bg-blue-50 text-blue-600" 
                          : "border-slate-100 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {formData.existingConditions.includes('Other') && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 space-y-2"
                  >
                    <label className="text-xs font-bold text-slate-700 tracking-wide">Please specify your condition</label>
                    <input 
                      type="text"
                      value={formData.otherCondition}
                      onChange={(e) => {
                        setFormData({...formData, otherCondition: e.target.value});
                        if (showValidationErrors) setShowValidationErrors(false);
                      }}
                      placeholder="Enter medical condition"
                      className={cn(
                        "w-full bg-slate-50 border-2 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all",
                        isMissing('otherCondition') ? "border-rose-500 bg-rose-50" : "border-slate-100"
                      )}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8">
            <StepHeader icon={AlertCircle} title="SECTION 6: Symptoms (Last 1–2 Months)" />
            <p className="text-xs font-bold text-slate-700">Have you experienced any of the following? (Select all that apply)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Frequent urination and excessive thirst',
                'Fatigue or weakness',
                'Blurred vision or slow wound healing',
                'Frequent headaches or dizziness',
                'Shortness of breath',
                'Pale skin, brittle nails, or hair fall',
                'Craving non-food items (e.g., ice, clay)',
                'Tingling sensation in hands or feet',
                'No symptoms'
              ].map(symptom => (
                <button 
                  key={symptom}
                  onClick={() => {
                    const current = formData.symptoms;
                    let next;
                    if (symptom === 'No symptoms') {
                      next = ['No symptoms'];
                    } else {
                      next = current.includes(symptom) 
                        ? current.filter((i: string) => i !== symptom)
                        : [...current.filter((i: string) => i !== 'No symptoms'), symptom];
                    }
                    setFormData({...formData, symptoms: next});
                    if (showValidationErrors) setShowValidationErrors(false);
                  }}
                  className={cn(
                    "p-4 rounded-xl font-bold border-2 text-left text-xs transition-all flex items-center gap-3",
                    formData.symptoms.includes(symptom) 
                      ? "border-blue-600 bg-blue-50 text-blue-600" 
                      : cn(
                          "border-slate-100 text-slate-500 hover:bg-slate-50",
                          isMissing('symptoms') && "border-rose-500 bg-rose-50/30"
                        )
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors",
                    formData.symptoms.includes(symptom) ? "bg-blue-600 border-blue-600" : "border-slate-200 bg-white"
                  )}>
                    {formData.symptoms.includes(symptom) && <CheckCircle2 className="text-white w-3 h-3" />}
                  </div>
                  {symptom}
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-8">
            <StepHeader icon={Zap} title="SECTION 7: Quick Camera Check" badge="95%+ Accuracy Boost" />
            
            <div className="space-y-6">
              <div className={cn(
                "p-6 rounded-[32px] border transition-all",
                "bg-white border-slate-100"
              )}>
                <label className="block text-sm font-bold text-slate-900 mb-2">33. Fingernail bed photo</label>
                <p className="text-xs text-slate-500 mb-4">Press finger against phone camera, good lighting, no flash needed.</p>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFormData({...formData, fingernailPhoto: e.target.files[0]});
                          if (showValidationErrors) setShowValidationErrors(false);
                        }
                      }}
                    />
                    <div className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all">
                      {formData.fingernailPhoto ? (
                        <div className="flex items-center gap-2 text-teal-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-bold">Photo Uploaded</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                            <ArrowRight className="text-slate-400 w-5 h-5 rotate-[-90deg]" />
                          </div>
                          <span className="text-xs font-bold text-slate-500">Click to upload photo</span>
                        </>
                      )}
                    </div>
                  </label>
                  {formData.fingernailPhoto && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100">
                      <img 
                        src={URL.createObjectURL(formData.fingernailPhoto)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-[32px] border border-slate-100 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-900">34. Lower eyelid photo</label>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optional</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">Gently pull down lower eyelid, look in mirror and snap.</p>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFormData({...formData, eyelidPhoto: e.target.files[0]});
                        }
                      }}
                    />
                    <div className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all">
                      {formData.eyelidPhoto ? (
                        <div className="flex items-center gap-2 text-teal-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-bold">Photo Uploaded</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                            <ArrowRight className="text-slate-400 w-5 h-5 rotate-[-90deg]" />
                          </div>
                          <span className="text-xs font-bold text-slate-500">Click to upload photo</span>
                        </>
                      )}
                    </div>
                  </label>
                  {formData.eyelidPhoto && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100">
                      <img 
                        src={URL.createObjectURL(formData.eyelidPhoto)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-[32px] border border-slate-100 bg-white">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-900">35. Home BP reading</label>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optional High-Accuracy</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">If you have a home BP machine, enter your latest reading (systolic / diastolic).</p>
                <input 
                  type="text"
                  value={formData.homeBP}
                  onChange={(e) => setFormData({...formData, homeBP: e.target.value})}
                  placeholder="e.g. 120/80"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-5 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Build ML input for the ResultsDashboard's What-If simulator
  const buildMlInput = (): FormDataInput => {
    const heightCm = ((parseInt(formData.heightFeet) || 5) * 12 + (parseInt(formData.heightInches) || 0)) * 2.54;
    return {
      age: formData.age || '30',
      gender: formData.gender || 'Male',
      height: String(Math.round(heightCm)),
      weight: formData.weight || '70',
      familyDiabetes: formData.parentsDiabetes === 'Both parents' ? 'Yes' : formData.parentsDiabetes === 'One parent' ? 'Yes' : 'No',
      familyHypertension: formData.relativesBP || 'No',
      familyAnemia: formData.familyAnemia || 'No',
      exerciseFrequency: formData.activity === 'Sedentary' ? 'Never' : formData.activity === 'Moderate' ? '2-3 times a week' : formData.activity === 'Active' ? 'Daily' : 'Rarely',
      diet: formData.dietType || 'Mixed',
      sleep: formData.sleep === 'Under 5 hours' ? 'Less than 5 hours' : '7\u20138 hours (recommended)',
      alcohol: formData.alcohol === 'Frequently' ? 'Frequently' : formData.alcohol === 'Occasionally' ? 'Occasionally' : 'Never',
      smoking: formData.smoke === 'Currently' ? 'Yes, regularly' : formData.smoke === 'Ex-smoker' ? 'Occasionally' : 'Never',
      stressLevel: formData.stress || 'Moderate',
      saltIntake: formData.saltyFoods === 'Daily' ? 'High' : formData.saltyFoods === 'Weekly' ? 'Moderate' : 'Low',
      sugarIntake: formData.sugaryFoods === 'Daily' ? 'Daily' : formData.sugaryFoods === 'Weekly' ? 'Weekly' : 'Rarely (natural only)',
      waterIntake: 'Moderate',
      fattyFood: 'Moderate',
      junkFood: 'Moderate',
      existingConditions: formData.existingConditions || [],
      symptoms: formData.symptoms || [],
      diagSugar: formData.diagSugar || 'No',
      gestationalDiabetes: formData.gestationalDiabetes || 'No',
      heavyBleeding: formData.heavyBleeding || '',
      periodDuration: formData.periodDuration || '',
      homeBP: formData.homeBP || '',
      fingernailPhoto: formData.fingernailPhoto,
      eyelidPhoto: formData.eyelidPhoto,
      otherCondition: formData.otherCondition || '',
    };
  };

  if (results) {
    return (
      <ResultsDashboard
        results={results}
        formData={buildMlInput()}
        onClose={onClose}
        language={language}
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden soft-shadow border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900">Health Risk Assessment</h2>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Takes only 5 minutes</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-500">Step {step} of {totalSteps}</span>
            <span className="text-sm font-bold text-teal-600">{progress}% done</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full medical-gradient"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between sticky bottom-0 z-10">
          <button 
            onClick={handleBack}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all",
              step === 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            {t.back}
          </button>
          
          <button 
            onClick={handleNext}
            disabled={isCalculating}
            className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {step === totalSteps ? 'Calculate Risk' : 'Next Step'}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Keep the old exports as wrappers for backward compatibility if needed, 
// but they all point to the new unified flow now.
export function AnemiaPredictor({ onClose, language }: { onClose: () => void, language: Language }) {
  return <DiseasePredictor onClose={onClose} language={language} initialDisease="anemia" />;
}

export function DiabetesPredictor({ onClose, language }: { onClose: () => void, language: Language }) {
  return <DiseasePredictor onClose={onClose} language={language} initialDisease="diabetes" />;
}

export function HypertensionPredictor({ onClose, language }: { onClose: () => void, language: Language }) {
  return <DiseasePredictor onClose={onClose} language={language} initialDisease="hypertension" />;
}
