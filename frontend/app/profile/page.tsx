"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { USER_ROLES, UserRole } from "@/lib/constants/roles"; // Убедимся, что UserRole импортирован
import { userApi } from "@/lib/api/user";
import type { 
  AnyFullProfile, 
  User, 
  Education, 
  Experience, 
  StudentProfile, // Corrected from FullStudentProfile
  EmployerProfile, // Corrected from FullEmployerProfile
  CampusProfile, // Corrected from FullCampusProfile
  AdminProfile // Corrected from FullAdminProfile
} from "@/lib/types"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "@/components/avatar-upload";
import ProtectedRoute from "@/components/protected-route";
import { Progress } from "@/components/ui/progress";
import { Shield, Briefcase, GraduationCap, Award, Users, Building2, Settings, ChevronDown, ChevronUp, Plus, Trash2, FileText, Download, CheckCircle2, Star } from "lucide-react"; // Добавим иконки, Star добавлена
import { Badge } from "@/components/ui/badge"; // Added Badge for skills
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added Tabs components

// ЗАГЛУШКИ для компонентов секций - их нужно будет создать/реализовать
const BasicInfoCard = ({ profileData, onInputChange, userRole, commonFieldsConfig }: { profileData: AnyFullProfile, onInputChange: Function, userRole: UserRole, commonFieldsConfig: any[] }) => (
    <Card>
        <CardHeader><CardTitle>Basic Information ({userRole})</CardTitle></CardHeader>
        <CardContent> {/* TODO: Implement based on commonFieldsConfig and profileData */} </CardContent>
    </Card>
);

// Props for StudentSections
interface StudentSectionsProps {
  profileData: StudentProfile;
  skillsInputValue: string;
  onSkillsChange: (value: string) => void;
  achievementsInputValue: string;
  onAchievementsChange: (value: string) => void;
  onInputChange: (field: keyof AnyFullProfile, value: any) => void;
  commonFieldsConfig: Array<{ key: keyof AnyFullProfile; label: string; type: string; placeholder?: string; readOnly?: boolean }>;
  onAddEducation: () => void;
  onRemoveEducation: (index: number) => void;
  onUpdateEducation: (index: number, field: keyof Education, value: string) => void;
  // TODO: Add props for education, experience, resumes
  onAddExperience: () => void;
  onRemoveExperience: (index: number) => void;
  onUpdateExperience: (index: number, field: keyof Experience, value: string | string[]) => void; // value can be string[] for skills_used
}

const StudentSections = ({ 
  profileData, 
  skillsInputValue, 
  onSkillsChange, 
  achievementsInputValue, 
  onAchievementsChange,
  onInputChange,
  commonFieldsConfig,
  onAddEducation,
  onRemoveEducation,
  onUpdateEducation,
  onAddExperience,
  onRemoveExperience,
  onUpdateExperience
}: StudentSectionsProps) => {
  const [activeTab, setActiveTab] = useState<string>("personal-info");

  return (
    <Card>
      <CardHeader><CardTitle>Student Details</CardTitle></CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
            <TabsTrigger value="skills-achievements">Skills & Achievements</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="resumes">Resumes</TabsTrigger>
          </TabsList>

          <TabsContent value="personal-info" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {commonFieldsConfig
                  .filter(field => profileData.hasOwnProperty(field.key as string) || ['name', 'email', 'phone', 'location'].includes(field.key as string))
                  .map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={`student-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`student-${field.key}`}
                      type={field.type}
                      value={(profileData[field.key as keyof StudentProfile] as string || "")} 
                      onChange={(e) => onInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      disabled={field.readOnly || false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Briefcase className="w-5 h-5 mr-2 text-teal-500" />Bio / Description</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Label htmlFor="student-description">Your Bio</Label>
                  <Textarea
                    id="student-description"
                    value={profileData.description || ""}
                    onChange={(e) => onInputChange('description', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills-achievements" className="space-y-6">
            {/* Skills Section Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" /> 
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="student-skills">Skills (comma-separated)</Label>
                  <Textarea
                    id="student-skills"
                    placeholder="e.g., JavaScript, React, Node.js, Python"
                    value={skillsInputValue}
                    onChange={(e) => onSkillsChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  {profileData.skills && profileData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Section Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="student-achievements">Achievements (one per line)</Label>
                  <Textarea
                    id="student-achievements"
                    placeholder="e.g., Dean's List Fall 2023\\nWon 1st place in Hackathon XYZ"
                    value={achievementsInputValue}
                    onChange={(e) => onAchievementsChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  {profileData.achievements && profileData.achievements.length > 0 && (
                    <ul className="list-disc list-inside pt-2 space-y-1">
                      {profileData.achievements.map((achievement, index) => (
                        <li key={index} className="text-sm">
                          {achievement} 
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="education" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-green-500" />
                  Education History
                </CardTitle>
                <Button onClick={onAddEducation} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Add Education
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.education && profileData.education.length > 0 ? (
                  profileData.education.map((edu, index) => (
                    <Card key={edu.id || index} className="p-4 border rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-md">
                          {edu.degree || 'Degree'} at {edu.university || 'University'}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveEducation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor={`edu-university-${index}`}>University/Institution</Label>
                          <Input
                            id={`edu-university-${index}`}
                            value={edu.university}
                            onChange={(e) => onUpdateEducation(index, 'university', e.target.value)}
                            placeholder="e.g., Harvard University"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                          <Input
                            id={`edu-degree-${index}`}
                            value={edu.degree}
                            onChange={(e) => onUpdateEducation(index, 'degree', e.target.value)}
                            placeholder="e.g., Bachelor of Science"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`edu-field-${index}`}>Field of Study</Label>
                          <Input
                            id={`edu-field-${index}`}
                            value={edu.field}
                            onChange={(e) => onUpdateEducation(index, 'field', e.target.value)}
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                            <Label htmlFor={`edu-start-date-${index}`}>Start Date</Label>
                            <Input
                                type="text" // Using text for now, consider a date picker
                                id={`edu-start-date-${index}`}
                                value={edu.start_date}
                                onChange={(e) => onUpdateEducation(index, 'start_date', e.target.value)}
                                placeholder="e.g., 2020-09"
                            />
                            </div>
                            <div className="space-y-1">
                            <Label htmlFor={`edu-end-date-${index}`}>End Date (or Expected)</Label>
                            <Input
                                type="text" // Using text for now, consider a date picker
                                id={`edu-end-date-${index}`}
                                value={edu.end_date}
                                onChange={(e) => onUpdateEducation(index, 'end_date', e.target.value)}
                                placeholder="e.g., 2024-06 or Present"
                            />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <Label htmlFor={`edu-description-${index}`}>Description (Optional)</Label>
                          <Textarea
                            id={`edu-description-${index}`}
                            value={edu.description || ""}
                            onChange={(e) => onUpdateEducation(index, 'description', e.target.value)}
                            placeholder="e.g., Relevant coursework, thesis, activities..."
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No education history added yet. Click "Add Education" to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
                  Work Experience
                </CardTitle>
                <Button onClick={onAddExperience} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Add Experience
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.experience && profileData.experience.length > 0 ? (
                  profileData.experience.map((exp, index) => (
                    <Card key={exp.id || index} className="p-4 border rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-md">
                          {exp.position || 'Position'} at {exp.company || 'Company'}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveExperience(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor={`exp-company-${index}`}>Company</Label>
                          <Input
                            id={`exp-company-${index}`}
                            value={exp.company}
                            onChange={(e) => onUpdateExperience(index, 'company', e.target.value)}
                            placeholder="e.g., Google"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`exp-position-${index}`}>Position/Role</Label>
                          <Input
                            id={`exp-position-${index}`}
                            value={exp.position}
                            onChange={(e) => onUpdateExperience(index, 'position', e.target.value)}
                            placeholder="e.g., Software Engineer Intern"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:col-span-2">
                            <div className="space-y-1">
                            <Label htmlFor={`exp-start-date-${index}`}>Start Date</Label>
                            <Input
                                type="text" // Consider a date picker
                                id={`exp-start-date-${index}`}
                                value={exp.start_date}
                                onChange={(e) => onUpdateExperience(index, 'start_date', e.target.value)}
                                placeholder="e.g., 2022-06"
                            />
                            </div>
                            <div className="space-y-1">
                            <Label htmlFor={`exp-end-date-${index}`}>End Date (or Present)</Label>
                            <Input
                                type="text" // Consider a date picker
                                id={`exp-end-date-${index}`}
                                value={exp.end_date}
                                onChange={(e) => onUpdateExperience(index, 'end_date', e.target.value)}
                                placeholder="e.g., 2022-09 or Present"
                            />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <Label htmlFor={`exp-description-${index}`}>Description (Optional)</Label>
                          <Textarea
                            id={`exp-description-${index}`}
                            value={exp.description || ""}
                            onChange={(e) => onUpdateExperience(index, 'description', e.target.value)}
                            placeholder="e.g., Developed key features for..., Led a team of..."
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No work experience added yet. Click "Add Experience" to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resumes">
            {/* TODO: Placeholder for Resumes section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Resumes</h3>
              <p className="text-sm text-muted-foreground">Resume management will be implemented here. (Content for Resumes Tab)</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Props for EmployerSections
interface EmployerSectionsProps {
  profileData: EmployerProfile;
  onInputChange: (field: keyof AnyFullProfile, value: any) => void;
  commonFieldsConfig: Array<{ key: keyof AnyFullProfile; label: string; type: string; placeholder?: string; readOnly?: boolean }>;
  companySkillsInputValue: string;
  onCompanySkillsChange: (value: string) => void;
}

const EmployerSections = ({ 
  profileData, 
  onInputChange, 
  commonFieldsConfig, 
  companySkillsInputValue, 
  onCompanySkillsChange 
}: EmployerSectionsProps) => {
  const [activeTab, setActiveTab] = useState<string>("company-details"); // Default to company-details

  // Filter out 'description' from commonFieldsConfig for Employer's Personal Info tab
  const employerCommonFields = commonFieldsConfig.filter(field => field.key !== 'description');

  return (
    <Card>
      <CardHeader><CardTitle>Employer & Company Details</CardTitle></CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="contact-info">Contact Person Info</TabsTrigger>
            <TabsTrigger value="company-details">Company Details</TabsTrigger>
          </TabsList>

          <TabsContent value="contact-info" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> Contact Person</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {employerCommonFields
                  .filter(field => profileData.hasOwnProperty(field.key as string) || ['name', 'email', 'phone', 'location'].includes(field.key as string))
                  .map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={`employer-contact-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`employer-contact-${field.key}`}
                      type={field.type}
                      value={(profileData[field.key as keyof EmployerProfile] as string || "")} 
                      onChange={(e) => onInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      disabled={field.readOnly || false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company-details" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Building2 className="w-5 h-5 mr-2 text-sky-500" /> Company Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="employer-company-name">Company Name</Label>
                  <Input
                    id="employer-company-name"
                    type="text"
                    value={(profileData as EmployerProfile).company_name || ""} 
                    onChange={(e) => onInputChange('company_name' as keyof AnyFullProfile, e.target.value)}
                    placeholder="Your Company LLC"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="employer-company-website">Company Website</Label>
                  <Input
                    id="employer-company-website"
                    type="url"
                    value={(profileData as EmployerProfile).company_website || ""} 
                    onChange={(e) => onInputChange('company_website' as keyof AnyFullProfile, e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="employer-company-description">Company Description</Label>
                  <Textarea
                    id="employer-company-description"
                    value={(profileData as EmployerProfile).description || ""} // description from BaseProfileData is company description
                    onChange={(e) => onInputChange('description' as keyof AnyFullProfile, e.target.value)}
                    placeholder="Describe your company..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employer-company-skills">Company Skills/Tags (comma-separated)</Label>
                  <Textarea
                    id="employer-company-skills"
                    placeholder="e.g., Fintech, AI, SaaS"
                    value={companySkillsInputValue}
                    onChange={(e) => onCompanySkillsChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  {(profileData as EmployerProfile).company_skills_tags && (profileData as EmployerProfile).company_skills_tags!.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(profileData as EmployerProfile).company_skills_tags!.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Props for CampusSections
interface CampusSectionsProps {
  profileData: CampusProfile;
  onInputChange: (field: keyof AnyFullProfile, value: any) => void;
  commonFieldsConfig: Array<{ key: keyof AnyFullProfile; label: string; type: string; placeholder?: string; readOnly?: boolean }>;
  programsOfferedInputValue: string;
  onProgramsOfferedChange: (value: string) => void;
}

const CampusSections = ({ 
  profileData, 
  onInputChange, 
  commonFieldsConfig, 
  programsOfferedInputValue, 
  onProgramsOfferedChange 
}: CampusSectionsProps) => {
  const [activeTab, setActiveTab] = useState<string>("personal-info");

  return (
    <Card>
      <CardHeader><CardTitle>Campus Details</CardTitle></CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4"> {/* 2 Tabs for now */}
            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
            <TabsTrigger value="campus-specifics">Campus Specifics</TabsTrigger>
          </TabsList>

          <TabsContent value="personal-info" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {commonFieldsConfig
                  .filter(field => profileData.hasOwnProperty(field.key as string) || ['name', 'email', 'phone', 'location'].includes(field.key as string))
                  .map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={`campus-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`campus-${field.key}`}
                      type={field.type}
                      value={(profileData[field.key as keyof CampusProfile] as string || "")} 
                      onChange={(e) => onInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      disabled={field.readOnly || false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Briefcase className="w-5 h-5 mr-2 text-teal-500" />Campus Description</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Label htmlFor="campus-description">Description of the Campus</Label>
                  <Textarea
                    id="campus-description"
                    value={profileData.description || ""}
                    onChange={(e) => onInputChange('description', e.target.value)}
                    placeholder="Tell us about your campus..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campus-specifics" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><GraduationCap className="w-5 h-5 mr-2 text-purple-500" /> Programs Offered</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="campus-programs">Programs Offered (one per line)</Label>
                  <Textarea
                    id="campus-programs"
                    placeholder="e.g., Computer Science\\nBusiness Administration"
                    value={programsOfferedInputValue}
                    onChange={(e) => onProgramsOfferedChange(e.target.value)}
                    className="min-h-[100px]"
                  />
                  {profileData.programs_offered && profileData.programs_offered.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm font-medium mb-1">Current Programs:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {profileData.programs_offered.map((program, index) => (
                          <li key={index} className="text-sm">
                            {program}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* TODO: Add other campus-specific fields if any, e.g., website, specific contact persons etc. */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Props for AdminSections
interface AdminSectionsProps {
  profileData: AdminProfile;
  onInputChange: (field: keyof AnyFullProfile, value: any) => void;
  commonFieldsConfig: Array<{ key: keyof AnyFullProfile; label: string; type: string; placeholder?: string; readOnly?: boolean }>;
}

const AdminSections = ({ 
  profileData, 
  onInputChange, 
  commonFieldsConfig 
}: AdminSectionsProps) => {
  const [activeTab, setActiveTab] = useState<string>("personal-info");

  return (
    <Card>
      <CardHeader><CardTitle>Administrator Control</CardTitle></CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4"> {/* 2 Tabs for Admin */}
            <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
            <TabsTrigger value="system-settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal-info" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500" /> Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {commonFieldsConfig
                  .filter(field => profileData.hasOwnProperty(field.key as string) || ['name', 'email', 'phone', 'location'].includes(field.key as string))
                  .map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={`admin-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`admin-${field.key}`}
                      type={field.type}
                      value={(profileData[field.key as keyof AdminProfile] as string || "")} 
                      onChange={(e) => onInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder || ''}
                      disabled={field.readOnly || false}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Briefcase className="w-5 h-5 mr-2 text-teal-500" />Admin Description</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Label htmlFor="admin-description">Your Description (optional)</Label>
                  <Textarea
                    id="admin-description"
                    value={profileData.description || ""}
                    onChange={(e) => onInputChange('description', e.target.value)}
                    placeholder="Brief description about your role or yourself..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system-settings" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Settings className="w-5 h-5 mr-2 text-gray-700" /> System Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="admin-system-name">System Name</Label>
                  <Input
                    id="admin-system-name"
                    type="text"
                    value={(profileData as AdminProfile).system_name || ""} 
                    onChange={(e) => onInputChange('system_name' as keyof AnyFullProfile, e.target.value)}
                    placeholder="e.g., StudentHunter Platform"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="admin-system-description">System Description</Label>
                  <Textarea
                    id="admin-system-description"
                    value={(profileData as AdminProfile).system_description || ""}
                    onChange={(e) => onInputChange('system_description' as keyof AnyFullProfile, e.target.value)}
                    placeholder="Brief overview of the system..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const StudentStatsCard = ({ profileData, completion, missingFields }: any) => (
    <Card><CardHeader><CardTitle>Profile Progress</CardTitle></CardHeader><CardContent><Progress value={completion} className="h-2" /> <p>{missingFields?.join(', ')}</p></CardContent></Card>
);

const EmployerStatsCard = ({ profileData }: any) => (
    <Card><CardHeader><CardTitle>Employer Stats</CardTitle></CardHeader><CardContent> {/* TODO */} </CardContent></Card>
);

const CampusStatsCard = ({ profileData }: any) => (
    <Card><CardHeader><CardTitle>Campus Stats</CardTitle></CardHeader><CardContent> {/* TODO */} </CardContent></Card>
);

const AdminStatsCard = ({ profileData }: any) => (
    <Card><CardHeader><CardTitle>Admin System Stats</CardTitle></CardHeader><CardContent> {/* TODO */} </CardContent></Card>
);


export default function UnifiedProfilePage() {
  const { user, isLoading: authLoading, refreshUserInfo } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState<AnyFullProfile | null>(null);
  const [initialProfileData, setInitialProfileData] = useState<AnyFullProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Состояния, специфичные для студента
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [skillsInputValue, setSkillsInputValue] = useState<string>("");
  const [achievementsInputValue, setAchievementsInputValue] = useState<string>("");
  // TODO: состояния для resumes, expandedExperience/Education для студента

  // Состояния, специфичные для кампуса
  const [programsOfferedInputValue, setProgramsOfferedInputValue] = useState<string>("");

  // Состояния, специфичные для работодателя
  const [companySkillsInputValue, setCompanySkillsInputValue] = useState<string>("");

  const calculateStudentProfileCompletion = useCallback((studentData: StudentProfile /*, resumes: any[] = [] */) => {
    // TODO: Перенести и адаптировать логику из student/profile/page.tsx
    // Учитывать обязательные поля для студента, включая education, experience, skills, achievements, bio
    // и новое правило "не менее 70% для подачи заявки"
    const requiredFields = [
      { name: "name", label: "Full Name", getValue: (p: StudentProfile) => p.name },
      { name: "email", label: "Email", getValue: (p: StudentProfile) => p.email },
      { name: "phone", label: "Phone Number", getValue: (p: StudentProfile) => p.phone },
      { name: "location", label: "Location", getValue: (p: StudentProfile) => p.location },
      { name: "bio", label: "Bio", getValue: (p: StudentProfile) => p.description }, // Changed p.bio to p.description
      { name: "skills", label: "Skills", getValue: (p: StudentProfile) => p.skills && p.skills.length > 0 },
      { name: "achievements", label: "Achievements", getValue: (p: StudentProfile) => p.achievements && p.achievements.length > 0 },
      { name: "education", label: "Education", getValue: (p: StudentProfile) => p.education && p.education.length > 0 && p.education[0]?.university },
      { name: "experience", label: "Experience", getValue: (p: StudentProfile) => p.experience && p.experience.length > 0 && p.experience[0]?.company },
      // { name: "resume", label: "Resume", getValue: () => resumes.length > 0 },
    ];

    let completedCount = 0;
    const missing: string[] = [];

    requiredFields.forEach(field => {
      if (field.getValue(studentData)) {
        completedCount++;
      } else {
        missing.push(field.label);
      }
    });
    const percentage = (completedCount / requiredFields.length) * 100;
    return { percentage, missing };
  }, []);


  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setPageLoading(true);
    try {
      const response = await userApi.getMyProfile();
      if (response.status === "success" && response.data) {
        const fullProfile = response.data as AnyFullProfile;
        setProfileData(fullProfile);
        setInitialProfileData(fullProfile);

        if (user.role === USER_ROLES.STUDENT) {
          const studentProfile = fullProfile as StudentProfile;
          const { percentage, missing } = calculateStudentProfileCompletion(studentProfile);
          setProfileCompletion(percentage);
          setMissingFields(missing);
          setSkillsInputValue(studentProfile.skills?.join(", ") || "");
          setAchievementsInputValue(studentProfile.achievements?.join("\n") || "");
        }
        if (user.role === USER_ROLES.CAMPUS) {
          const campusProfile = fullProfile as CampusProfile;
          setProgramsOfferedInputValue(campusProfile.programs_offered?.join("\n") || "");
        }
        if (user.role === USER_ROLES.EMPLOYER) {
          const employerProfile = fullProfile as EmployerProfile;
          setCompanySkillsInputValue(employerProfile.company_skills_tags?.join(", ") || "");
        }
      } else {
        toast.error(response.message || "Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setPageLoading(false);
    }
  }, [user, calculateStudentProfileCompletion]); // Добавляем calculateStudentProfileCompletion в зависимости

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router, fetchProfile]); // Добавляем fetchProfile

  const handleInputChange = useCallback((field: keyof AnyFullProfile, value: any) => {
    setProfileData(prev => {
      if (!prev) return null;
      // Для сложных полей (массивы объектов как education/experience) нужна отдельная логика
      // Этот обработчик больше для простых полей
      return { ...prev, [field]: value } as AnyFullProfile;
    });
  }, []);
  
  const handleStudentSkillsChange = useCallback((newRawValue: string) => {
    setSkillsInputValue(newRawValue);
    const skillsArray = newRawValue.split(",").map(skill => skill.trim()).filter(Boolean);
    setProfileData(prev => 
        (prev && prev.role === USER_ROLES.STUDENT) 
            ? { ...prev, skills: skillsArray } as AnyFullProfile 
            : prev
    );
  }, []);

  const handleStudentAchievementsChange = useCallback((newRawValue: string) => {
    setAchievementsInputValue(newRawValue);
    const newAchievements = newRawValue.split("\n").map(s => s.trim()).filter(s => s);
     setProfileData(prev => 
        (prev && prev.role === USER_ROLES.STUDENT) 
            ? { ...prev, achievements: newAchievements } as AnyFullProfile
            : prev
    );
  }, []);

  const handleCampusProgramsChange = useCallback((newRawValue: string) => {
    setProgramsOfferedInputValue(newRawValue);
    const programsArray = newRawValue.split("\n").map(p => p.trim()).filter(Boolean);
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.CAMPUS) {
        // Ensure we are casting to the specific profile type before spreading and adding new fields
        return { ...(prev as CampusProfile), programs_offered: programsArray } as CampusProfile;
      }
      return prev;
    });
  }, []);

  const handleEmployerSkillsChange = useCallback((newRawValue: string) => {
    setCompanySkillsInputValue(newRawValue);
    const skillsArray = newRawValue.split(",").map(skill => skill.trim()).filter(Boolean);
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.EMPLOYER) {
        return { ...(prev as EmployerProfile), company_skills_tags: skillsArray } as EmployerProfile;
      }
      return prev;
    });
  }, []);

  // Обработчики для Education (студент)
  const handleAddEducationItem = useCallback(() => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        const newEducationEntry: Education = {
          // id: String(Date.now()), // ID будет присвоен бэкендом или использовать UUID
          id: `new_${Date.now()}`, // Временный ID для ключей React, бэк должен присвоить реальный
          university: "",
          field: "",
          degree: "",
          start_date: "",
          end_date: "",
          description: "",
        };
        return {
          ...studentProfile,
          education: [...(studentProfile.education || []), newEducationEntry],
        } as StudentProfile;
      }
      return prev;
    });
  }, []);

  const handleRemoveEducationItem = useCallback((index: number) => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        if (studentProfile.education) {
          const updatedEducation = [...studentProfile.education];
          updatedEducation.splice(index, 1);
          return { ...studentProfile, education: updatedEducation } as StudentProfile;
        }
      }
      return prev;
    });
  }, []);

  const handleUpdateEducationItem = useCallback((index: number, field: keyof Education, value: string) => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        if (studentProfile.education && studentProfile.education[index]) {
          const updatedEducation = [...studentProfile.education];
          updatedEducation[index] = { ...updatedEducation[index], [field]: value };
          return { ...studentProfile, education: updatedEducation } as StudentProfile;
        }
      }
      return prev;
    });
  }, []);

  // TODO: Обработчики для experience (add, update, remove, move) для студента

  // Обработчики для Experience (студент)
  const handleAddExperienceItem = useCallback(() => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        const newExperienceEntry: Experience = {
          id: `new_exp_${Date.now()}`, // Временный ID
          company: "",
          position: "", // Corrected from role
          start_date: "",
          end_date: "",
          description: "",
          // skills_used: [], // Removed as it's not in Experience type
        };
        return {
          ...studentProfile,
          experience: [...(studentProfile.experience || []), newExperienceEntry],
        } as StudentProfile;
      }
      return prev;
    });
  }, []);

  const handleRemoveExperienceItem = useCallback((index: number) => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        if (studentProfile.experience) {
          const updatedExperience = [...studentProfile.experience];
          updatedExperience.splice(index, 1);
          return { ...studentProfile, experience: updatedExperience } as StudentProfile;
        }
      }
      return prev;
    });
  }, []);

  const handleUpdateExperienceItem = useCallback((index: number, field: keyof Experience, value: string | string[]) => {
    setProfileData(prev => {
      if (prev && prev.role === USER_ROLES.STUDENT) {
        const studentProfile = prev as StudentProfile;
        if (studentProfile.experience && studentProfile.experience[index]) {
          const updatedExperience = [...studentProfile.experience];
          // Simplified update: skills_used logic removed as it's not in Experience type
          updatedExperience[index] = { ...updatedExperience[index], [field]: value as string }; // Ensure value is string if Experience fields are strings
          return { ...studentProfile, experience: updatedExperience } as StudentProfile;
        }
      }
      return prev;
    });
  }, []);

  const handleProfileUpdate = async () => {
    if (!profileData || !initialProfileData || !user) return;
    setSaving(true);
    try {
      let changedData: Partial<AnyFullProfile> = {};
      
      // Собираем только измененные данные
      (Object.keys(profileData) as Array<keyof AnyFullProfile>).forEach(key => {
        if (JSON.stringify(profileData[key]) !== JSON.stringify(initialProfileData[key])) {
          (changedData as any)[key] = profileData[key];
        }
      });

      if (Object.keys(changedData).length === 0) {
        toast.info("No changes to save.");
        setSaving(false);
        return;
      }
      
      const response = await userApi.updateProfile(changedData); // userApi.updateProfile должен принимать Partial<AnyFullProfile>
      if (response.status === "success" && response.data) {
        const updatedFullProfile = response.data as AnyFullProfile;
        setProfileData(updatedFullProfile);
        setInitialProfileData(updatedFullProfile);
        toast.success("Profile updated successfully!");
        if (refreshUserInfo) await refreshUserInfo();
        // Если это студент, пересчитать процент заполнения и обновить инпуты
        if (user.role === USER_ROLES.STUDENT) {
            const studentProfile = updatedFullProfile as StudentProfile;
            const { percentage, missing } = calculateStudentProfileCompletion(studentProfile);
            setProfileCompletion(percentage);
            setMissingFields(missing);
            setSkillsInputValue(studentProfile.skills?.join(", ") || "");
            setAchievementsInputValue(studentProfile.achievements?.join("\n") || "");
        } else if (user.role === USER_ROLES.CAMPUS) { // Добавлено для кампуса
            const campusProfile = updatedFullProfile as CampusProfile;
            setProgramsOfferedInputValue(campusProfile.programs_offered?.join("\n") || "");
        } else if (user.role === USER_ROLES.EMPLOYER) { // Added for employer
            const employerProfile = updatedFullProfile as EmployerProfile;
            setCompanySkillsInputValue(employerProfile.company_skills_tags?.join(", ") || "");
        }
      } else {
        toast.error(response.message || "Failed to update profile.");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-blue"></div>
      </div>
    );
  }

  if (!user || !profileData) {
    return <div className="text-center py-10">Could not load profile data. Please try refreshing.</div>;
  }
  
  // Конфигурация общих полей для StudentSections
  const commonFieldsConfiguration: Array<{ key: keyof AnyFullProfile; label: string; type: string; readOnly?: boolean; placeholder?: string }> = [
    { key: 'name', label: 'Full Name', type: 'text', readOnly: false },
    { key: 'email', label: 'Email', type: 'email', readOnly: true }, // Email обычно не меняется
    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 555-5555', readOnly: false },
    { key: 'location', label: 'Location', type: 'text', placeholder: 'City, State', readOnly: false },
  ];


  return (
    <ProtectedRoute roles={[USER_ROLES.STUDENT, USER_ROLES.EMPLOYER, USER_ROLES.CAMPUS, USER_ROLES.ADMIN]}>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/50 to-background">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
            {`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Profile`}
          </h1>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-vibrant-blue to-vibrant-purple"></div>
                <CardContent className="-mt-16 relative flex flex-col items-center">
                  {user.role !== USER_ROLES.ADMIN ? (
                    <AvatarUpload
                      currentAvatar={profileData.avatar}
                      onAvatarChange={(newAvatarUrl) => {
                        setProfileData(prev => prev ? { ...prev, avatar: newAvatarUrl } as AnyFullProfile : null);
                        setInitialProfileData(prev => prev ? { ...prev, avatar: newAvatarUrl } as AnyFullProfile : null);
                      }}
                      role={user.role as UserRole}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                      <Shield className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <h2 className="mt-4 text-2xl font-bold text-center">
                    {profileData.name || (profileData as EmployerProfile).company_name || "User Profile"} 
                  </h2>
                  <p className="text-muted-foreground text-center">{user.role}</p>
                </CardContent>
              </Card>
              
              {/* Статистика в зависимости от роли */}
              {user.role === USER_ROLES.STUDENT && <StudentStatsCard profileData={profileData as StudentProfile} completion={profileCompletion} missingFields={missingFields} />}
              {user.role === USER_ROLES.EMPLOYER && <EmployerStatsCard profileData={profileData as EmployerProfile} />}
              {user.role === USER_ROLES.CAMPUS && <CampusStatsCard profileData={profileData as CampusProfile} />}
              {user.role === USER_ROLES.ADMIN && <AdminStatsCard profileData={profileData as AdminProfile} />}
              
              {/* TODO: Для студента здесь может быть секция с резюме */}
            </div>

            <div className="md:col-span-2 space-y-6">
              {/* Общая информация и описание - УДАЛЕНО ОТСЮДА 
              <BasicInfoCard 
                profileData={profileData} 
                onInputChange={handleInputChange} 
                userRole={user.role as UserRole}
                commonFieldsConfig={commonFieldsConfiguration}
              />
              <Card>
                <CardHeader><CardTitle>Description / Bio</CardTitle></CardHeader>
                <CardContent>
                    <Textarea
                        value={profileData?.description || ""} 
                        onChange={(e) => handleInputChange('description', e.target.value)} 
                        className="min-h-[120px]"
                        placeholder="Tell us about yourself or your organization"
                    />
                </CardContent>
              </Card>
              */}

              {/* Секции, специфичные для роли */}
              {user.role === USER_ROLES.STUDENT && (
                <StudentSections 
                    profileData={profileData as StudentProfile} 
                    onSkillsChange={handleStudentSkillsChange}
                    onAchievementsChange={handleStudentAchievementsChange}
                    skillsInputValue={skillsInputValue}
                    achievementsInputValue={achievementsInputValue}
                    onInputChange={handleInputChange}
                    commonFieldsConfig={commonFieldsConfiguration}
                    onAddEducation={handleAddEducationItem}
                    onRemoveEducation={handleRemoveEducationItem}
                    onUpdateEducation={handleUpdateEducationItem}
                    onAddExperience={handleAddExperienceItem}
                    onRemoveExperience={handleRemoveExperienceItem}
                    onUpdateExperience={handleUpdateExperienceItem}
                />
              )}
              {user.role === USER_ROLES.EMPLOYER && 
                <EmployerSections 
                  profileData={profileData as EmployerProfile} 
                  onInputChange={handleInputChange} 
                  commonFieldsConfig={commonFieldsConfiguration}
                  companySkillsInputValue={companySkillsInputValue}
                  onCompanySkillsChange={handleEmployerSkillsChange}
                />}
              {user.role === USER_ROLES.CAMPUS && 
                <CampusSections 
                  profileData={profileData as CampusProfile} 
                  onInputChange={handleInputChange}
                  commonFieldsConfig={commonFieldsConfiguration}
                  programsOfferedInputValue={programsOfferedInputValue}
                  onProgramsOfferedChange={handleCampusProgramsChange}
                />}
              {user.role === USER_ROLES.ADMIN && 
                <AdminSections 
                  profileData={profileData as AdminProfile} 
                  onInputChange={handleInputChange}
                  commonFieldsConfig={commonFieldsConfiguration}
                />}
              
              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  onClick={handleProfileUpdate}
                  disabled={saving || (user.role === USER_ROLES.STUDENT && profileCompletion < 70)}
                  className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue"
                  title={user.role === USER_ROLES.STUDENT && profileCompletion < 70 ? "Profile must be at least 70% complete to save changes that might affect applications." : undefined}
                >
                  {saving ? (
                    <> <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saving... </>
                  ) : (
                    <> <CheckCircle2 className="w-4 h-4 mr-2" /> Save Changes </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 