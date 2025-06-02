import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";
import { useAuth } from "../state/authContext";
import { useDonations, useDonorStats } from "../state/donations";
import { useBloodBanks } from "../state/bloodBanks";
import { Calendar, Droplet, Heart, MapPin, Clock, Trophy, Target } from "lucide-react";

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
    <div className="grid grid-nogutter gap-4 p-4">
      {/* Welcome Section */}
      <div className="col-12">
        <Card className="border-none shadow-2">
          <div className="flex align-items-center justify-content-between">
            <div>
              <h2 className="m-0 text-2xl font-bold text-900">Welcome back, {user?.email?.split('@')[0] || 'Donor'}!</h2>
              <p className="mt-2 mb-0 text-600">Thank you for being a lifesaver. Here's your donation summary.</p>
            </div>
            <div className="flex align-items-center gap-2">
              <Heart size={32} className="text-red-500" />
              <span className="text-sm font-medium text-500">Active Donor</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="col-12 lg:col-3 md:col-6">
        <Card className="border-none shadow-2 h-full">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500 mb-2">
              {donorStats?.totalDonations || 0}
            </div>
            <div className="text-sm text-600 uppercase">Total Donations</div>
            <Droplet size={24} className="text-blue-500 mt-2" />
          </div>
        </Card>
      </div>

      <div className="col-12 lg:col-3 md:col-6">
        <Card className="border-none shadow-2 h-full">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-2">
              {donorStats?.totalVolume || 0}ml
            </div>
            <div className="text-sm text-600 uppercase">Total Volume</div>
            <Trophy size={24} className="text-red-500 mt-2" />
          </div>
        </Card>
      </div>

      <div className="col-12 lg:col-3 md:col-6">
        <Card className="border-none shadow-2 h-full">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500 mb-2">
              {getNextEligibleDate()}
            </div>
            <div className="text-sm text-600 uppercase">Next Eligible Date</div>
            <Calendar size={24} className="text-green-500 mt-2" />
          </div>
        </Card>
      </div>

      <div className="col-12 lg:col-3 md:col-6">
        <Card className="border-none shadow-2 h-full">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500 mb-2">
              {donorStats?.averageHemoglobin || 'N/A'}
            </div>
            <div className="text-sm text-600 uppercase">Avg Hemoglobin</div>
            <Target size={24} className="text-purple-500 mt-2" />
          </div>
        </Card>
      </div>

      {/* Progress to Next Milestone */}
      <div className="col-12">
        <Card className="border-none shadow-2">
          <div className="flex align-items-center justify-content-between mb-3">
            <h3 className="m-0 text-lg font-semibold text-900">Progress to Next Milestone</h3>
            <Chip 
              label={`${progress.current}/${progress.next} donations`} 
              className="bg-blue-100 text-blue-700"
            />
          </div>
          <ProgressBar 
            value={progress.percentage} 
            className="mb-2"
            style={{ height: '12px' }}
          />
          <p className="text-sm text-600 m-0">
            {progress.next - progress.current} more donations to reach your next milestone!
          </p>
        </Card>
      </div>

      {/* Recent Donations */}
      <div className="col-12 lg:col-8">
        <Card title="Recent Donations" className="border-none shadow-2">
          {donationsLoading ? (
            <div className="text-center p-4">Loading your donations...</div>
          ) : donations.length > 0 ? (
            <div className="flex flex-column gap-3">
              {donations.map((donation: any, index: number) => (
                <div key={donation.id || index} className="flex align-items-center justify-content-between p-3 border-200 border-round">
                  <div className="flex align-items-center gap-3">
                    <div className="w-3rem h-3rem bg-red-100 text-red-600 border-round flex align-items-center justify-content-center">
                      <Droplet size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-900">
                        {donation.volumeCollected || 450}ml donated
                      </div>
                      <div className="text-sm text-600">
                        {new Date(donation.donationDate || donation.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Chip 
                      label={donation.status || 'completed'} 
                      className={`${donation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                    />
                  </div>
                </div>
              ))}
              <Divider />
              <div className="text-center">
                <Button 
                  label="View All Donations" 
                  className="p-button-text"
                  icon={<Calendar size={16} className="mr-2" />}
                />
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <Heart size={48} className="text-300 mb-3" />
              <p className="text-600 mb-3">No donations recorded yet</p>
              <Button 
                label="Schedule Your First Donation" 
                className="p-button-outlined"
                icon={<Calendar size={16} className="mr-2" />}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Nearby Blood Banks */}
      <div className="col-12 lg:col-4">
        <Card title="Nearby Donation Centers" className="border-none shadow-2">
          <div className="flex flex-column gap-3">
            {bloodBanks.slice(0, 3).map((bank: any, index: number) => (
              <div key={bank._id || index} className="flex align-items-center gap-3 p-2 hover:bg-gray-50 border-round cursor-pointer">
                <div className="w-2rem h-2rem bg-blue-100 text-blue-600 border-round flex align-items-center justify-content-center">
                  <MapPin size={16} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-900 text-sm">{bank.name}</div>
                  <div className="text-xs text-600">{bank.city}, {bank.state}</div>
                </div>
              </div>
            ))}
            <Divider />
            <Button 
              label="Find More Centers" 
              className="p-button-text w-full"
              icon={<MapPin size={16} className="mr-2" />}
            />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="col-12">
        <Card title="Quick Actions" className="border-none shadow-2">
          <div className="grid grid-nogutter gap-3">
            <div className="col-12 sm:col-6 lg:col-3">
              <Button 
                label="Schedule Donation" 
                className="w-full p-button-outlined"
                icon={<Calendar size={16} className="mr-2" />}
              />
            </div>
            <div className="col-12 sm:col-6 lg:col-3">
              <Button 
                label="Find Blood Banks" 
                className="w-full p-button-outlined"
                icon={<MapPin size={16} className="mr-2" />}
              />
            </div>
            <div className="col-12 sm:col-6 lg:col-3">
              <Button 
                label="View Requests" 
                className="w-full p-button-outlined"
                icon={<Heart size={16} className="mr-2" />}
              />
            </div>
            <div className="col-12 sm:col-6 lg:col-3">
              <Button 
                label="Update Profile" 
                className="w-full p-button-outlined"
                icon={<Clock size={16} className="mr-2" />}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DonorHomePage;
