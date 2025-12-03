import { getModeratorsList, getModeratorInvitations } from '@/lib/actions/admin-moderators'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import {
  Users,
  UserPlus,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Shield,
  ShieldCheck,
  Crown,
} from 'lucide-react'
import { ModeratorActions } from '@/components/admin/moderator-actions'

export default async function AdminModeratorsPage() {
  const [moderatorsResult, allAdminsResult, invitationsResult] = await Promise.all([
    getModeratorsList(false),  // Only moderators
    getModeratorsList(true),   // All admin staff
    getModeratorInvitations()
  ])

  const moderators = moderatorsResult.moderators || []
  const allAdmins = allAdminsResult.moderators || []
  const invitations = invitationsResult.invitations || []

  const pendingInvitations = invitations.filter(
    (inv: any) => !inv.accepted_at && new Date(inv.expires_at) > new Date()
  )

  // Get role badge color
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-500/10 text-purple-600"><Crown className="h-3 w-3 mr-1" />Super Admin</Badge>
      case 'admin':
        return <Badge className="bg-blue-500/10 text-blue-600"><ShieldCheck className="h-3 w-3 mr-1" />Admin</Badge>
      case 'moderator':
        return <Badge className="bg-green-500/10 text-green-600"><Shield className="h-3 w-3 mr-1" />Moderator</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Manage Moderators
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, suspend, or remove moderators from the platform
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/moderators/invite">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Moderator
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Admin Staff
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allAdmins.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {allAdmins.filter((a: any) => a.role === 'super_admin').length} super admins,{' '}
              {allAdmins.filter((a: any) => a.role === 'admin').length} admins,{' '}
              {allAdmins.filter((a: any) => a.role === 'moderator').length} moderators
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Moderators
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderators.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Staff
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allAdmins.filter((m: any) => m.status !== 'suspended').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Invitations
            </CardTitle>
            <Mail className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvitations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all-staff">
        <TabsList>
          <TabsTrigger value="all-staff">
            All Admin Staff ({allAdmins.length})
          </TabsTrigger>
          <TabsTrigger value="moderators">
            Moderators ({moderators.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations ({invitations.length})
          </TabsTrigger>
        </TabsList>

        {/* All Admin Staff Tab */}
        <TabsContent value="all-staff" className="mt-6">
          {allAdmins.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No admin staff yet</h3>
                <p className="text-muted-foreground mb-4">
                  Invite your first moderator to get started.
                </p>
                <Button asChild>
                  <Link href="/admin/moderators/invite">Invite Moderator</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Admin Staff</CardTitle>
                <CardDescription>
                  View all admins and moderators on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allAdmins.map((admin: any) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {admin.profile?.full_name?.[0] || admin.profile?.email?.[0] || 'A'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {admin.profile?.full_name || 'Unknown'}
                            </span>
                            {getRoleBadge(admin.role)}
                            {admin.status === 'suspended' && (
                              <Badge variant="destructive">Suspended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {admin.profile?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(admin.created_at).toLocaleDateString()}
                          </div>
                          {admin.last_active && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last active {new Date(admin.last_active).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/moderators/${admin.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {admin.role === 'moderator' && (
                            <ModeratorActions
                              moderatorId={admin.id}
                              status={admin.status}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Moderators Tab */}
        <TabsContent value="moderators" className="mt-6">
          {moderators.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No moderators yet</h3>
                <p className="text-muted-foreground mb-4">
                  Invite your first moderator to get started.
                </p>
                <Button asChild>
                  <Link href="/admin/moderators/invite">Invite Moderator</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>All Moderators</CardTitle>
                <CardDescription>
                  Manage moderator access and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderators.map((moderator: any) => (
                    <div
                      key={moderator.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            {moderator.profile?.full_name?.[0] || moderator.profile?.email?.[0] || 'M'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {moderator.profile?.full_name || 'Unknown'}
                            </span>
                            {moderator.status === 'suspended' ? (
                              <Badge variant="destructive">Suspended</Badge>
                            ) : (
                              <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {moderator.profile?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(moderator.created_at).toLocaleDateString()}
                          </div>
                          {moderator.last_active && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last active {new Date(moderator.last_active).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/moderators/${moderator.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <ModeratorActions
                            moderatorId={moderator.id}
                            status={moderator.status}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="mt-6">
          {invitations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No invitations</h3>
                <p className="text-muted-foreground mb-4">
                  No pending or past invitations.
                </p>
                <Button asChild>
                  <Link href="/admin/moderators/invite">Send Invitation</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Invitation History</CardTitle>
                <CardDescription>
                  Track pending and completed invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.map((invitation: any) => {
                    const isExpired = new Date(invitation.expires_at) < new Date()
                    const isAccepted = !!invitation.accepted_at

                    return (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{invitation.email}</span>
                              {isAccepted ? (
                                <Badge className="bg-green-500/10 text-green-600">Accepted</Badge>
                              ) : isExpired ? (
                                <Badge variant="secondary">Expired</Badge>
                              ) : (
                                <Badge className="bg-orange-500/10 text-orange-600">Pending</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Invited by {invitation.inviter?.full_name || invitation.inviter?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm text-muted-foreground">
                            <div>Sent {new Date(invitation.created_at).toLocaleDateString()}</div>
                            {isAccepted ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Accepted {new Date(invitation.accepted_at).toLocaleDateString()}
                              </div>
                            ) : isExpired ? (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <XCircle className="h-3 w-3" />
                                Expired {new Date(invitation.expires_at).toLocaleDateString()}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-orange-600">
                                <Clock className="h-3 w-3" />
                                Expires {new Date(invitation.expires_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
