import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";
import { Badge } from "primereact/badge";
import { Avatar } from "primereact/avatar";
import { Skeleton } from "primereact/skeleton";
import { useAuth } from "../state/authContext";
import { useDonations, useDonorStats } from "../state/donations";
import { useBloodBanks } from "../state/bloodBanks";
import { Calendar, Droplet, Heart, MapPin, Clock, Trophy, Target, TrendingUp, Activity } from "lucide-react";

const DonorHomePage: React.FC = () => {  const { user } = useAuth();
    // Get donor's donation history
  const { data: donationsData, isLoading: donationsLoading } = useDonations({
    donorId: user?.donorProfile || user?._id, // Fallback to user._id if donorProfile not set yet
    pageSize: 5, // Show last 5 donations
  });
  // Get donor statistics
  const { data: donorStats } = useDonorStats(user?.donorProfile || user?._id); // Fallback to user._id if donorProfile not set yet

  // Get nearby blood banks for quick access
  const { data: bloodBanksData } = useBloodBanks({ limit: 3 });

  const donations = donationsData?.content || [];
  const bloodBanks = bloodBanksData?.results || [];

  // Calculate next eligible donation date
  const getNextEligibleDate = () => {
    if (donorStats?.eligibleToDonateSince) {
      return new Date(donorStats.eligibleToDonateSince).toLocaleDateString();
    }
    return "Available now";
  };

  // Calculate progress to next milestone
  const getProgressToNextMilestone = () => {
    const current = donorStats?.totalDonations || 0;
    const milestones = [5, 10, 25, 50, 100];
    const nextMilestone = milestones.find(m => m > current) || 100;
    return {
      current,
      next: nextMilestone,
      percentage: (current / nextMilestone) * 100
    };
  };

  const progress = getProgressToNextMilestone();
  return (
    <div className="p-4">
      {/* Hero Section with Gradient Background */}
      <div className="mb-4">
        <Card className="border-none shadow-3 surface-gradient">
          <div className="flex flex-column lg:flex-row align-items-center justify-content-between gap-4">
            <div className="flex-1">
              <div className="flex align-items-center gap-3 mb-3">
                <Avatar 
                  icon={<Heart size={24} />} 
                  className="bg-red-500 text-white" 
                  size="large" 
                />
                <div>
                  <h1 className="m-0 text-3xl font-bold text-900">
                    Welcome back, {user?.email?.split('@')[0] || 'Donor'}!
                  </h1>
                  <p className="m-0 text-600 text-lg">Thank you for being a lifesaver</p>
                </div>
              </div>
              <Badge 
                value="Active Donor" 
                severity="success" 
                className="text-sm"
              />
            </div>
            <div className="text-center lg:text-right">
              <div className="text-4xl font-bold text-red-500 mb-1">
                {donorStats?.totalDonations || 0}
              </div>
              <div className="text-sm text-600 uppercase font-semibold">
                Total Donations
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid mb-4">
        <div className="col-12 md:col-6 lg:col-3">
          <Card className="border-none shadow-2 h-full hover:shadow-4 transition-all transition-duration-200">
            <div className="text-center p-3">
              <div className="inline-flex align-items-center justify-content-center w-4rem h-4rem bg-blue-100 border-circle mb-3">
                <Droplet size={28} className="text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {donorStats?.totalVolume || 0}ml
              </div>
              <div className="text-sm text-600 font-medium uppercase tracking-wide">
                Total Volume
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="border-none shadow-2 h-full hover:shadow-4 transition-all transition-duration-200">
            <div className="text-center p-3">
              <div className="inline-flex align-items-center justify-content-center w-4rem h-4rem bg-green-100 border-circle mb-3">
                <Calendar size={28} className="text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-600 mb-2">
                {getNextEligibleDate()}
              </div>
              <div className="text-sm text-600 font-medium uppercase tracking-wide">
                Next Eligible Date
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="border-none shadow-2 h-full hover:shadow-4 transition-all transition-duration-200">
            <div className="text-center p-3">
              <div className="inline-flex align-items-center justify-content-center w-4rem h-4rem bg-purple-100 border-circle mb-3">
                <Target size={28} className="text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {donorStats?.averageHemoglobin || 'N/A'}
              </div>
              <div className="text-sm text-600 font-medium uppercase tracking-wide">
                Avg Hemoglobin
              </div>
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <Card className="border-none shadow-2 h-full hover:shadow-4 transition-all transition-duration-200">
            <div className="text-center p-3">
              <div className="inline-flex align-items-center justify-content-center w-4rem h-4rem bg-orange-100 border-circle mb-3">
                <TrendingUp size={28} className="text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {Math.round(progress.percentage)}%
              </div>
              <div className="text-sm text-600 font-medium uppercase tracking-wide">
                Milestone Progress
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Progress Section with Enhanced Design */}
      <div className="mb-4">
        <Card className="border-none shadow-3">
          <div className="flex align-items-center justify-content-between mb-4">
            <div className="flex align-items-center gap-3">
              <Avatar 
                icon={<Trophy size={20} />} 
                className="bg-yellow-500 text-white" 
              />
              <div>
                <h3 className="m-0 text-xl font-semibold text-900">Progress to Next Milestone</h3>
                <p className="m-0 text-sm text-600">Keep up the great work!</p>
              </div>
            </div>
            <Chip 
              label={`${progress.current}/${progress.next} donations`} 
              className="bg-primary text-white font-semibold"
            />
          </div>
          <ProgressBar 
            value={progress.percentage} 
            className="mb-3"
            style={{ height: '16px' }}
            color="#3B82F6"
          />
          <div className="flex justify-content-between align-items-center">
            <p className="text-sm text-600 m-0">
              {progress.next - progress.current} more donations to reach your next milestone
            </p>
            <Badge 
              value={`${Math.round(progress.percentage)}% Complete`} 
              severity="info"
            />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid">
        {/* Recent Donations - Enhanced */}
        <div className="col-12 lg:col-8">
          <Card className="border-none shadow-3 h-full">
            <div className="flex align-items-center justify-content-between mb-4">
              <h3 className="m-0 text-xl font-semibold text-900">Recent Donations</h3>
              <Button 
                label="View All" 
                icon={<Activity size={16} />}
                className="p-button-text p-button-sm"
              />
            </div>
            
            {donationsLoading ? (
              <div className="flex flex-column gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex align-items-center gap-3 p-3">
                    <Skeleton shape="circle" size="3rem" />
                    <div className="flex-1">
                      <Skeleton width="60%" height="1rem" className="mb-2" />
                      <Skeleton width="40%" height="0.8rem" />
                    </div>
                    <Skeleton width="80px" height="2rem" />
                  </div>
                ))}
              </div>
            ) : donations.length > 0 ? (
              <div className="flex flex-column gap-3">
                {donations.map((donation: any, index: number) => (
                  <div key={donation.id || index} className="flex align-items-center justify-content-between p-4 border-1 surface-border border-round-lg hover:surface-hover transition-colors transition-duration-150">
                    <div className="flex align-items-center gap-4">
                      <div className="inline-flex align-items-center justify-content-center w-3rem h-3rem bg-red-100 border-circle">
                        <Droplet size={20} className="text-red-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-900 mb-1">
                          {donation.volumeCollected || 450}ml donated
                        </div>
                        <div className="text-sm text-600">
                          {new Date(donation.donationDate || donation.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>                    <div className="text-right">
                      <Chip 
                        label={donation.status || 'completed'} 
                        className={donation.status === 'completed' ? 'p-chip-success' : 'p-chip-warning'}
                      />
                    </div>
                  </div>
                ))}
                <Divider />
                <div className="text-center pt-2">
                  <Button 
                    label="Schedule New Donation" 
                    icon={<Calendar size={16} />}
                    className="p-button-outlined"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="inline-flex align-items-center justify-content-center w-6rem h-6rem bg-surface-100 border-circle mb-4">
                  <Heart size={48} className="text-400" />
                </div>
                <h4 className="text-900 font-semibold mb-2">No donations yet</h4>
                <p className="text-600 mb-4">Start your donation journey today and save lives!</p>
                <Button 
                  label="Schedule Your First Donation" 
                  icon={<Calendar size={16} />}
                  className="p-button-lg"
                />
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar with Enhanced Cards */}
        <div className="col-12 lg:col-4">
          <div className="flex flex-column gap-4">
            {/* Nearby Blood Banks */}
            <Card className="border-none shadow-3">
              <div className="flex align-items-center justify-content-between mb-4">
                <h4 className="m-0 text-lg font-semibold text-900">Nearby Centers</h4>
                <Badge value={bloodBanks.length} severity="info" />
              </div>
              
              <div className="flex flex-column gap-3">
                {bloodBanks.slice(0, 3).map((bank: any, index: number) => (
                  <div key={bank._id || index} className="flex align-items-center gap-3 p-3 border-1 surface-border border-round-lg hover:surface-hover cursor-pointer transition-colors transition-duration-150">
                    <div className="inline-flex align-items-center justify-content-center w-2rem h-2rem bg-blue-100 border-circle">
                      <MapPin size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-900 text-sm mb-1 text-overflow-ellipsis overflow-hidden white-space-nowrap">
                        {bank.name}
                      </div>
                      <div className="text-xs text-600">
                        {bank.city}, {bank.state}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  label="Explore All Centers" 
                  icon={<MapPin size={14} />}
                  className="p-button-text w-full mt-2"
                />
              </div>
            </Card>

            {/* Quick Actions with Modern Layout */}
            <Card className="border-none shadow-3">
              <h4 className="m-0 text-lg font-semibold text-900 mb-4">Quick Actions</h4>
              
              <div className="grid grid-nogutter gap-2">
                <div className="col-6">
                  <Button 
                    label="Schedule" 
                    icon={<Calendar size={16} />}
                    className="w-full p-button-outlined p-button-sm"
                  />
                </div>
                <div className="col-6">
                  <Button 
                    label="Find Banks" 
                    icon={<MapPin size={16} />}
                    className="w-full p-button-outlined p-button-sm"
                  />
                </div>
                <div className="col-6">
                  <Button 
                    label="Requests" 
                    icon={<Heart size={16} />}
                    className="w-full p-button-outlined p-button-sm"
                  />
                </div>
                <div className="col-6">
                  <Button 
                    label="Profile" 
                    icon={<Clock size={16} />}
                    className="w-full p-button-outlined p-button-sm"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorHomePage;
