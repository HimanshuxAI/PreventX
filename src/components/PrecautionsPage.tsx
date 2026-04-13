import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Apple, Footprints, Moon, Droplets, Heart } from 'lucide-react';
import { Language, translations } from '../types';

interface PrecautionsPageProps {
  language: Language;
}

export function PrecautionsPage({ language }: PrecautionsPageProps) {
  const t = translations[language];

  const precautions = [
    {
      title: t.diabetesPrevention,
      icon: Droplets,
      color: "bg-teal-50 text-teal-600",
      tips: [
        { icon: Apple, text: language === 'en' ? "Follow a low-sugar Indian diet (Millets, Green leafy vegetables)." : language === 'hi' ? "कम चीनी वाले भारतीय आहार (बाजरा, हरी पत्तेदार सब्जियां) का पालन करें।" : "कमी साखरेचा भारतीय आहार (बाजरी, हिरव्या पालेभाज्या) पाळा।" },
        { icon: Footprints, text: language === 'en' ? "Walk for at least 30 minutes daily." : language === 'hi' ? "रोजाना कम से कम 30 मिनट टहलें।" : "दररोज किमान 30 मिनिटे चाला।" },
        { icon: Moon, text: language === 'en' ? "Maintain a consistent sleep schedule." : language === 'hi' ? "नींद का एक सुसंगत कार्यक्रम बनाए रखें।" : "झोपण्याचे सातत्यपूर्ण वेळापत्रक ठेवा।" },
        { icon: ShieldCheck, text: language === 'en' ? "Monitor glucose levels regularly if over 40." : language === 'hi' ? "यदि 40 से अधिक है तो नियमित रूप से ग्लूकोज स्तर की निगरानी करें।" : "40 वर्षांपेक्षा जास्त असल्यास नियमितपणे ग्लुकोजच्या पातळीचे निरीक्षण करा।" },
      ]
    },
    {
      title: t.hypertensionPrevention,
      icon: Heart,
      color: "bg-rose-50 text-rose-600",
      tips: [
        { icon: Apple, text: language === 'en' ? "Reduce salt intake in daily meals." : language === 'hi' ? "दैनिक भोजन में नमक का सेवन कम करें।" : "दैनंदिन जेवणात मिठाचे प्रमाण कमी करा।" },
        { icon: ShieldCheck, text: language === 'en' ? "Manage stress through yoga and meditation." : language === 'hi' ? "योग और ध्यान के माध्यम से तनाव का प्रबंधन करें।" : "योग आणि ध्यानाद्वारे तणावाचे व्यवस्थापन करा।" },
        { icon: Footprints, text: language === 'en' ? "Maintain a healthy weight for your age." : language === 'hi' ? "अपनी उम्र के हिसाब से स्वस्थ वजन बनाए रखें।" : "तुमच्या वयानुसार निरोगी वजन राखा।" },
        { icon: Moon, text: language === 'en' ? "Avoid tobacco and limit alcohol consumption." : language === 'hi' ? "तंबाकू से बचें और शराब का सेवन सीमित करें।" : "तंबाखू टाळा आणि अल्कोहोलचे सेवन मर्यादित करा।" },
      ]
    },
    {
      title: t.anemiaPrevention,
      icon: ShieldCheck,
      color: "bg-blue-50 text-blue-600",
      tips: [
        { icon: Apple, text: language === 'en' ? "Eat iron-rich foods like Spinach, Jaggery, and Pomegranates." : language === 'hi' ? "पालक, गुड़ और अनार जैसे आयरन से भरपूर खाद्य पदार्थ खाएं।" : "पालक, गूळ आणि डाळिंब यांसारखे लोहयुक्त पदार्थ खा।" },
        { icon: ShieldCheck, text: language === 'en' ? "Include Vitamin C (Amla, Lemon) to help iron absorption." : language === 'hi' ? "आयरन अवशोषण में मदद के लिए विटामिन सी (आंवला, नींबू) शामिल करें।" : "लोह शोषण्यास मदत करण्यासाठी व्हिटॅमिन सी (आवळा, लिंबू) समाविष्ट करा।" },
        { icon: Moon, text: language === 'en' ? "Ensure proper rest and hydration." : language === 'hi' ? "उचित आराम और हाइड्रेशन सुनिश्चित करें।" : "योग्य विश्रांती आणि हायड्रेशन सुनिश्चित करा।" },
        { icon: Footprints, text: language === 'en' ? "Regular deworming for children and pregnant women." : language === 'hi' ? "बच्चों और गर्भवती महिलाओं के लिए नियमित कृमि मुक्ति।" : "मुले आणि गर्भवती महिलांसाठी नियमित जंतनिर्मूलन।" },
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
      <header className="mb-12">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{t.healthPrecautions}</h1>
        <p className="text-slate-500 font-medium">{t.precautionsSubtitle}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {precautions.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[40px] p-8 soft-shadow border border-slate-100"
          >
            <div className={`w-16 h-16 ${section.color} rounded-[24px] flex items-center justify-center mb-8`}>
              <section.icon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-8">{section.title}</h2>
            <div className="space-y-6">
              {section.tips.map((tip, j) => (
                <div key={j} className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <tip.icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium pt-2">
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-teal-600 rounded-[32px] p-10 text-white flex items-center justify-between">
        <div className="max-w-xl">
          <h3 className="text-2xl font-bold mb-4">{t.needPlan}</h3>
          <p className="text-white/80 font-medium">
            {t.nutriPlanDesc}
          </p>
        </div>
        <button className="px-8 py-4 bg-white text-teal-600 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl">
          {t.talkNutriBot}
        </button>
      </div>
      <p className="mt-8 text-center text-xs text-slate-400 font-medium italic">
        {t.precautionsNote}
      </p>
    </div>
  );
}
