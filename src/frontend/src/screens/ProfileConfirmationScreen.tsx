import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Edit3, Briefcase, GraduationCap, MapPin, Mail, Phone, Check, X, Award, Star, Microscope, BookOpen, Info } from "lucide-react";
import { Sidebar } from "../components/Sidebar";

export function ProfileConfirmationScreen() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "Alex Chen",
    location: "Hong Kong",
    email: "alex.chen@example.com",
    phone: "+852 1234 5678",
    targetRoles: "Product Manager, Strategy Consultant",
    targetIndustries: "FinTech, Management Consulting",
    availability: "4 days/week, 6 months",
    salaryExpectation: "25,000 HKD/month",
    companySize: "MNC (1000+)",
    preferences: "Prefers small, agile teams. Highly values mentorship and clear progression paths. Willing to work long hours if the work is impactful.",
    experiences: [
      {
        id: 1,
        title: "Business Analyst Intern",
        company: "McKinsey & Company",
        date: "Jun 2024 - Aug 2024",
        location: "Hong Kong",
        bullets: [
          "Conducted market sizing and competitor analysis for a leading APAC retail bank.",
          "Developed financial models to evaluate potential M&A targets, presenting findings to partners."
        ]
      },
      {
        id: 2,
        title: "Product Intern",
        company: "Tencent",
        date: "May 2023 - Aug 2023",
        location: "Shenzhen, China",
        bullets: [
          "Assisted in the product lifecycle management of a new feature in WeChat Pay.",
          "Analyzed user behavior data using SQL to identify drop-off points in the onboarding funnel."
        ]
      },
      {
        id: 3,
        title: "Undergraduate Researcher",
        company: "HKU FinTech Lab",
        date: "Sep 2023 - Present",
        location: "Hong Kong",
        bullets: [
          "Researched the impact of CBDCs on cross-border payment efficiency.",
          "Co-authored a paper accepted at the International Conference on Financial Innovation."
        ]
      }
    ],
    education: [
      {
        id: 1,
        school: "The University of Hong Kong (HKU)",
        degree: "Bachelor of Business Administration (BBA)",
        date: "Sep 2021 - Present • Expected Graduation: May 2025",
        details: "CGPA: 3.8/4.0 • Dean's List 2022, 2023"
      }
    ],
    publications: [
      {
        id: 1,
        title: "The Future of Cross-Border Payments: A CBDC Perspective",
        authors: "Chen, A., Wong, B., & Smith, J.",
        venue: "International Conference on Financial Innovation",
        date: "2024"
      }
    ],
    extracurriculars: [
      {
        id: 1,
        title: "President",
        organization: "HKU Consulting Club",
        date: "Sep 2023 - Present",
        bullets: [
          "Led a team of 20+ members to organize case competitions and networking events.",
          "Secured sponsorships from top-tier consulting firms."
        ]
      }
    ],
    skills: "Python, SQL, Tableau, Figma, Financial Modeling, Market Research",
    miscellaneous: {
      honors: "HKU Foundation Scholarship (2021), National Economics Olympiad Gold Medalist (2020)",
      interests: "Marathon Running, Behavioral Economics, Specialty Coffee"
    }
  });

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, save to backend here
  };

  const updateExperience = (id: number, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const updateEducation = (id: number, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const updatePublication = (id: number, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      publications: prev.publications.map(pub => 
        pub.id === id ? { ...pub, [field]: value } : pub
      )
    }));
  };

  const updateExtracurricular = (id: number, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      extracurriculars: prev.extracurriculars.map(ext => 
        ext.id === id ? { ...ext, [field]: value } : ext
      )
    }));
  };

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-10">
            <div className="flex justify-between items-start mb-10 pb-8 border-b border-gray-100">
              <div className="flex gap-6 items-center w-full">
                <div className="w-24 h-24 bg-[#5c9be6]/20 rounded-full flex items-center justify-center text-[#113a7a] text-3xl font-bold shrink-0">
                  A
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-3 w-full max-w-md">
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="text-3xl font-bold text-gray-900 w-full border-b-2 border-[#5c9be6]/30 focus:border-[#5c9be6] focus:outline-none pb-1 bg-transparent"
                      />
                      <div className="flex flex-col gap-2 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <input 
                            type="text" 
                            value={profile.location}
                            onChange={(e) => setProfile({...profile, location: e.target.value})}
                            className="w-full border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 shrink-0" />
                          <input 
                            type="email" 
                            value={profile.email}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            className="w-full border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 shrink-0" />
                          <input 
                            type="tel" 
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="w-full border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                      <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</span>
                        <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profile.email}</span>
                        <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {profile.phone}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="text-gray-500 p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleSave}
                    className="text-white p-3 bg-[#113a7a] hover:bg-[#0d2b5c] rounded-full transition-colors shadow-sm"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-[#5c9be6] p-3 bg-[#5c9be6]/10 hover:bg-[#5c9be6]/20 rounded-full transition-colors shrink-0"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#5c9be6]" />
                Career Preferences
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Roles</h3>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.targetRoles}
                      onChange={(e) => setProfile({...profile, targetRoles: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6]"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.targetRoles}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Industries</h3>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.targetIndustries}
                      onChange={(e) => setProfile({...profile, targetIndustries: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6]"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.targetIndustries}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Availability</h3>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.availability}
                      onChange={(e) => setProfile({...profile, availability: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6]"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.availability}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Salary Expectation</h3>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.salaryExpectation}
                      onChange={(e) => setProfile({...profile, salaryExpectation: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6]"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.salaryExpectation}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Company Size</h3>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profile.companySize}
                      onChange={(e) => setProfile({...profile, companySize: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6]"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.companySize}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Strengths & Personality</h3>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold">High Ambition</span>
                    <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold">Interpersonal Sensitivity</span>
                    <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-semibold">Prudence</span>
                  </div>
                  {isEditing ? (
                    <textarea 
                      value={profile.preferences}
                      onChange={(e) => setProfile({...profile, preferences: e.target.value})}
                      rows={3}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] resize-none"
                    />
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {profile.preferences}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#5c9be6]" />
                  Work Experience
                </h2>
                {isEditing && (
                  <button className="text-sm font-medium text-[#5c9be6] hover:text-[#113a7a]">
                    + Add Experience
                  </button>
                )}
              </div>
              <div className="space-y-8">
                {profile.experiences.map((exp, index) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-gray-200">
                    <div className={`absolute w-3 h-3 ${index === 0 ? 'bg-[#5c9be6]' : 'bg-gray-300'} rounded-full -left-[7px] top-1.5 ring-4 ring-white`}></div>
                    {isEditing ? (
                      <div className="space-y-2 mb-4">
                        <input 
                          type="text" 
                          value={exp.title}
                          onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                          className="w-full text-lg font-bold text-gray-900 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="w-full text-[#5c9be6] font-medium border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={exp.date}
                            onChange={(e) => updateExperience(exp.id, 'date', e.target.value)}
                            className="w-1/2 text-sm text-gray-500 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                          />
                          <input 
                            type="text" 
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            className="w-1/2 text-sm text-gray-500 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                          />
                        </div>
                        <textarea 
                          value={exp.bullets.join('\n')}
                          onChange={(e) => updateExperience(exp.id, 'bullets', e.target.value)}
                          rows={3}
                          className="w-full text-sm text-gray-700 border border-gray-200 rounded-md p-2 focus:border-[#5c9be6] focus:outline-none resize-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                        <p className="text-[#5c9be6] font-medium mb-1">{exp.company}</p>
                        <p className="text-sm text-gray-500 mb-3">{exp.date} • {exp.location}</p>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1.5">
                          {exp.bullets.map((bullet, i) => (
                            <li key={i}>{bullet}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#5c9be6]" />
                  Education
                </h2>
                {isEditing && (
                  <button className="text-sm font-medium text-[#5c9be6] hover:text-[#113a7a]">
                    + Add Education
                  </button>
                )}
              </div>
              <div className="space-y-8">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute w-3 h-3 bg-[#5c9be6] rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    {isEditing ? (
                      <div className="space-y-2 mb-4">
                        <input 
                          type="text" 
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                          className="w-full text-lg font-bold text-gray-900 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="w-full text-[#5c9be6] font-medium border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={edu.date}
                          onChange={(e) => updateEducation(edu.id, 'date', e.target.value)}
                          className="w-full text-sm text-gray-500 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={edu.details}
                          onChange={(e) => updateEducation(edu.id, 'details', e.target.value)}
                          className="w-full text-sm text-gray-700 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-gray-900">{edu.school}</h3>
                        <p className="text-[#5c9be6] font-medium mb-1">{edu.degree}</p>
                        <p className="text-sm text-gray-500">{edu.date}</p>
                        <p className="text-sm text-gray-700 mt-2">{edu.details}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#5c9be6]" />
                  Extracurriculars
                </h2>
                {isEditing && (
                  <button className="text-sm font-medium text-[#5c9be6] hover:text-[#113a7a]">
                    + Add Extracurricular
                  </button>
                )}
              </div>
              <div className="space-y-8">
                {profile.extracurriculars.map((ext) => (
                  <div key={ext.id} className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute w-3 h-3 bg-[#5c9be6] rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    {isEditing ? (
                      <div className="space-y-2 mb-4">
                        <input 
                          type="text" 
                          value={ext.title}
                          onChange={(e) => updateExtracurricular(ext.id, 'title', e.target.value)}
                          className="w-full text-lg font-bold text-gray-900 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={ext.organization}
                          onChange={(e) => updateExtracurricular(ext.id, 'organization', e.target.value)}
                          className="w-full text-[#5c9be6] font-medium border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={ext.date}
                          onChange={(e) => updateExtracurricular(ext.id, 'date', e.target.value)}
                          className="w-full text-sm text-gray-500 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <textarea 
                          value={ext.bullets.join('\n')}
                          onChange={(e) => updateExtracurricular(ext.id, 'bullets', e.target.value)}
                          rows={2}
                          className="w-full text-sm text-gray-700 border border-gray-200 rounded-md p-2 focus:border-[#5c9be6] focus:outline-none resize-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-gray-900">{ext.title}</h3>
                        <p className="text-[#5c9be6] font-medium mb-1">{ext.organization}</p>
                        <p className="text-sm text-gray-500 mb-3">{ext.date}</p>
                        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1.5">
                          {ext.bullets.map((bullet, i) => (
                            <li key={i}>{bullet}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#5c9be6]" />
                  Publications
                </h2>
                {isEditing && (
                  <button className="text-sm font-medium text-[#5c9be6] hover:text-[#113a7a]">
                    + Add Publication
                  </button>
                )}
              </div>
              <div className="space-y-8">
                {profile.publications.map((pub) => (
                  <div key={pub.id} className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute w-3 h-3 bg-[#5c9be6] rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                    {isEditing ? (
                      <div className="space-y-2 mb-4">
                        <input 
                          type="text" 
                          value={pub.title}
                          onChange={(e) => updatePublication(pub.id, 'title', e.target.value)}
                          className="w-full text-lg font-bold text-gray-900 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={pub.authors}
                          onChange={(e) => updatePublication(pub.id, 'authors', e.target.value)}
                          className="w-full text-[#5c9be6] font-medium border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={pub.venue}
                          onChange={(e) => updatePublication(pub.id, 'venue', e.target.value)}
                          className="w-full text-sm text-gray-700 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={pub.date}
                          onChange={(e) => updatePublication(pub.id, 'date', e.target.value)}
                          className="w-full text-sm text-gray-500 border-b border-gray-200 focus:border-[#5c9be6] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-gray-900">{pub.title}</h3>
                        <p className="text-[#5c9be6] font-medium mb-1">{pub.authors}</p>
                        <p className="text-sm text-gray-700">{pub.venue}</p>
                        <p className="text-sm text-gray-500 mt-1">{pub.date}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#5c9be6]" />
                  Miscellaneous
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Honors & Awards</h3>
                  {isEditing ? (
                    <textarea 
                      value={profile.miscellaneous.honors}
                      onChange={(e) => setProfile({...profile, miscellaneous: {...profile.miscellaneous, honors: e.target.value}})}
                      rows={2}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] resize-none"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium leading-relaxed">{profile.miscellaneous.honors}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Interests</h3>
                  {isEditing ? (
                    <textarea 
                      value={profile.miscellaneous.interests}
                      onChange={(e) => setProfile({...profile, miscellaneous: {...profile.miscellaneous, interests: e.target.value}})}
                      rows={2}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] resize-none"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium leading-relaxed">{profile.miscellaneous.interests}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#5c9be6]" />
                  Skills
                </h2>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                {isEditing ? (
                  <textarea 
                    value={profile.skills}
                    onChange={(e) => setProfile({...profile, skills: e.target.value})}
                    rows={2}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5c9be6]/20 focus:border-[#5c9be6] resize-none"
                  />
                ) : (
                  <p className="text-gray-900 font-medium leading-relaxed">{profile.skills}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
