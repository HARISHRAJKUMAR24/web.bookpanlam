"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateAppointment } from "@/lib/api/appointments";
import { useRouter } from "next/navigation";

interface AppointmentActionFormProps {
  appointment: any;
}

const AppointmentActionForm = ({ appointment }: AppointmentActionFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: appointment?.status || 'pending',
    paymentStatus: appointment?.paymentStatus || appointment?.status || 'pending',
    employeeId: appointment?.employeeId || appointment?.employee_id || '',
    employeeCommission: appointment?.employeeCommission || 0,
    charges: appointment?.charges || 0,
    remark: appointment?.remark || ''
  });

  console.log("Form data from appointment:", appointment);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateAppointment(
        appointment.appointmentId || appointment.appointment_id, 
        {
          status: formData.status,
          paymentStatus: formData.paymentStatus,
          employeeId: formData.employeeId,
          employeeCommission: formData.employeeCommission,
          charges: formData.charges,
          remark: formData.remark
        }
      );

      if (result.success) {
        toast.success("Appointment updated successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update appointment");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'paid', label: 'Paid' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Appointment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select value={formData.paymentStatus} onValueChange={(value) => handleChange('paymentStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                placeholder="Enter employee ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCommission">Employee Commission (%)</Label>
              <Input
                id="employeeCommission"
                type="number"
                value={formData.employeeCommission}
                onChange={(e) => handleChange('employeeCommission', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="charges">Additional Charges</Label>
              <Input
                id="charges"
                type="number"
                value={formData.charges}
                onChange={(e) => handleChange('charges', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea
              id="remark"
              value={formData.remark}
              onChange={(e) => handleChange('remark', e.target.value)}
              placeholder="Add any remarks or notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Appointment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppointmentActionForm;