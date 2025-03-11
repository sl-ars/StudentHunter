import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import ProtectedRoute from "@/components/protected-route"

export default function AdminRegisterPage() {
  return (
    <ProtectedRoute roles="admin">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-6">Register New Account</h1>
          <form className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" placeholder="Enter email" required />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input type="text" id="name" placeholder="Enter name" required />
            </div>
            <div>
              <Label htmlFor="surname">Surname</Label>
              <Input type="text" id="surname" placeholder="Enter surname" required />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" required>
                <option value="">Select a role</option>
                <option value="student">Student</option>
                <option value="employer">Employer</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">Temporary Password</Label>
              <Input type="password" id="password" placeholder="Enter temporary password" required />
            </div>
            <Button type="submit" className="w-full">
              Register Account
            </Button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}

