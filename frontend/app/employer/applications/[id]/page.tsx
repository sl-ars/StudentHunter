"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { employerApi } from "@/lib/api"
import type { Application } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"
import { FileText, CalendarDays, Briefcase, UserCircle, Mail, ExternalLink, CheckCircle, XCircle, Clock, Phone } from "lucide-react"
import Link from "next/link"

export default function ApplicationDetailsPage() {
  const params = useParams()
  const applicationId = params.id as string
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (applicationId) {
      const fetchApplicationDetails = async () => {
        setLoading(true)
        try {
          const response = await employerApi.getApplication(applicationId)
          if (response.status === "success" && response.data) {
            setApplication(response.data)
          } else {
            toast.error(response.message || "Failed to fetch application details.")
            setApplication(null)
          }
        } catch (error) {
          console.error("Error fetching application details:", error)
          toast.error("An error occurred while fetching application details.")
          setApplication(null)
        } finally {
          setLoading(false)
        }
      }
      fetchApplicationDetails()
    }
  }, [applicationId])

  const handleUpdateStatus = async (status: "accepted" | "rejected") => {
    if (!application) return;
    try {
      await employerApi.updateApplicationStatus(application.id, status);
      setApplication(prev => prev ? { ...prev, status } : null);
      toast.success(`Application status updated to ${status}.`);
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <p>Loading application details...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-screen">
        <p>Application not found or failed to load.</p>
      </div>
    )
  }

  const jobDetails = typeof application.job === 'object' ? application.job : application.job_details;
  const displayName = application.applicant_name?.trim() ? application.applicant_name.trim() : 
                      (typeof application.applicant === 'object' && application.applicant.name?.trim()) ? application.applicant.name.trim() : "Unnamed Applicant";
  const avatarFallbackChar = displayName.charAt(0).toUpperCase();
  const applicantUser = typeof application.applicant === 'object' ? application.applicant : null;

  // Check if resume is a string and then if it looks like a link.
  const isResumeLink = typeof application.resume === 'string' && 
                       (application.resume.startsWith('/') || application.resume.startsWith('http'));

  return (
    <ProtectedRoute roles={["employer"]}>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="border-b">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={applicantUser?.avatar} 
                  alt={displayName} 
                />
                <AvatarFallback>{avatarFallbackChar}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{displayName}</CardTitle>
                <CardDescription className="flex items-center text-gray-600">
                  <Mail className="mr-2 h-4 w-4" /> {applicantUser?.email || application.applicant_email || "No email provided"}
                </CardDescription>
                {application.applicant_phone && (
                  <CardDescription className="flex items-center text-gray-600 mt-1">
                    <Phone className="mr-2 h-4 w-4" /> {application.applicant_phone}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" />Job Details</h3>
                <p><strong>Position:</strong> {application.job_title || jobDetails?.title}</p>
                <p><strong>Company:</strong> {application.job_company || jobDetails?.company_name}</p>
                {jobDetails?.id && (
                   <Link href={`/jobs/${jobDetails.id}`} passHref>
                     <Button variant="link" className="p-0 h-auto text-primary hover:underline">
                       View Job Posting <ExternalLink className="ml-1 h-4 w-4" />
                     </Button>
                   </Link>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary" />Applicant Profile</h3>
                {/* Detailed profile fields (location, university, education, experience, skills) removed as per user request. */}
                {/* The fallback message below will display if these details are not available in the data. */}
                {!applicantUser?.location && !applicantUser?.university &&
                 (!application.applicant_profile || 
                 (!application.applicant_profile.education && 
                  !application.applicant_profile.experience && 
                  (!application.applicant_profile.skills || application.applicant_profile.skills.length === 0))) && (
                  <p className="text-gray-500 italic">Detailed profile information (education, experience, skills, location, university) not provided or not applicable.</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Cover Letter</h3>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">{application.cover_letter || "No cover letter provided."}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Resume</h3>
              {application.resume ? (
                isResumeLink ? (
                  <Link href={application.resume} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      View Resume <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <p className="text-gray-700">Resume attached (ID: {application.resume})</p>
                )
              ) : (
                <p className="text-gray-700">No resume provided.</p>
              )}
            </div>

            {application.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">{application.notes}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" />Application Status</h3>
              <p className="capitalize">Current Status: <strong>{application.status}</strong></p>
              <p className="text-sm text-gray-500 flex items-center"><CalendarDays className="mr-2 h-4 w-4" />Applied on: {new Date(application.created_at).toLocaleDateString()}</p>
              {application.interview_date && (
                <p className="text-sm text-gray-500">Interview Date: {new Date(application.interview_date).toLocaleString()}</p>
              )}
            </div>

            {application.status !== "accepted" && application.status !== "rejected" && (
              <div className="flex space-x-4 pt-4 border-t">
                <Button onClick={() => handleUpdateStatus("accepted")} variant="default" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" /> Accept
                </Button>
                <Button onClick={() => handleUpdateStatus("rejected")} variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
} 