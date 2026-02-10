"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, CreditCard, Stethoscope, Building, FileText, IndianRupee, MapPin, Phone, Mail } from "lucide-react";

interface AppointmentDetailsCardsProps {
  appointment: any;
}

const AppointmentDetailsCards = ({ appointment }: AppointmentDetailsCardsProps) => {
  if (!appointment) return null;
  
  console.log("📌 Card component received data:", appointment);
  
  // Extract data directly from appointment (not appointment.data)
  const data = appointment;
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'waiting': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5);
  };

  const formatCurrency = (amount: number | string, currency: string = 'INR') => {
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return '₹0.00';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
      }).format(numAmount);
    } catch (error) {
      return '₹0.00';
    }
  };

  return (
    <div className="space-y-5">
      {/* Appointment Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Appointment ID</p>
              <p className="font-medium">{data.appointmentId || data.appointment_id || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p className="font-medium">{formatDate(data.date || data.appointment_date)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Time</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <p className="font-medium">
                  {data.time ? `${formatTime(data.time)}` : 'N/A'}
                  {data.slot_to && ` - ${formatTime(data.slot_to)}`}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Status</p>
              <Badge className={`${getStatusColor(data.status)} font-medium`}>
                {data.status?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.customer || data.name ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{data.customer?.name || data.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer ID</p>
                  <p className="font-medium">{data.customer?.customerId || data.customer_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">{data.customer?.email || data.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">{data.customer?.phone || data.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{data.customer?.address || data.address || 'N/A'}</p>
                      {(data.customer?.area || data.area) && (
                        <p className="text-sm text-gray-600">{data.customer?.area || data.area}</p>
                      )}
                      {(data.customer?.postalCode || data.postalCode) && (
                        <p className="text-sm text-gray-600">Postal Code: {data.customer?.postalCode || data.postalCode}</p>
                      )}
                    </div>
                  </div>
                </div>
                {(data.customer?.photo || data.photo) && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Photo</p>
                    <img 
                      src={data.customer?.photo || data.photo} 
                      alt="Customer" 
                      className="w-24 h-24 rounded-lg object-cover border"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No customer information available</p>
          )}
        </CardContent>
      </Card>

      {/* Service Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.service?.type === 'department' || data.service_reference_type === 'department' ? (
              <Building className="h-5 w-5" />
            ) : (
              <Stethoscope className="h-5 w-5" />
            )}
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.service || data.service_reference_id ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Service Type</p>
                  <Badge variant="outline" className="mt-1">
                    {data.service?.type === 'department' || data.service_reference_type === 'department' ? 'Department' : 'Doctor Consultation'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service Name</p>
                  <p className="font-medium">{data.service?.name || data.service_name || 'N/A'}</p>
                </div>
              </div>

              {(data.service?.type !== 'department' && data.service_reference_type !== 'department') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {data.service?.doctorName && (
                    <div>
                      <p className="text-sm text-gray-500">Doctor</p>
                      <p className="font-medium">{data.service.doctorName}</p>
                    </div>
                  )}
                  {data.service?.specialization && (
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-medium">{data.service.specialization}</p>
                    </div>
                  )}
                  {data.service?.qualification && (
                    <div>
                      <p className="text-sm text-gray-500">Qualification</p>
                      <p className="font-medium">{data.service.qualification}</p>
                    </div>
                  )}
                  {data.service?.experience && (
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">{data.service.experience} years</p>
                    </div>
                  )}
                  {data.service?.regNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Registration No.</p>
                      <p className="font-medium">{data.service.regNumber}</p>
                    </div>
                  )}
                </div>
              )}

              {data.service?.image && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Image</p>
                  <img 
                    src={data.service.image} 
                    alt={data.service.doctorName || data.service.name} 
                    className="w-32 h-32 rounded-lg object-cover border"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No service information available</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Payment Method</p>
              <Badge variant="outline" className="uppercase">
                {data.paymentMethod || data.payment_method || 'N/A'}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Base Amount</p>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-gray-500" />
                <p className="font-medium">{formatCurrency(data.amount, data.currency)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Amount</p>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-gray-500" />
                <p className="font-medium">{formatCurrency(data.total_amount, data.currency)}</p>
              </div>
            </div>
            {(data.gstPercentage > 0 || data.gst_percent > 0) && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">GST ({data.gstPercentage || data.gst_percent}%)</p>
                <p className="font-medium">{formatCurrency(data.gst_amount, data.currency)}</p>
              </div>
            )}
          </div>

          {data.paymentId && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">Payment ID</p>
              <p className="font-medium font-mono text-sm">{data.paymentId}</p>
            </div>
          )}

          {data.receipt && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Receipt Number</p>
                  <p className="font-medium">{data.receipt}</p>
                </div>
                <button className="text-primary hover:text-primary/80 text-sm font-medium">
                  Download Receipt
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-medium">{formatDate(data.createdAt || data.created_at)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Token Count</p>
              <p className="font-medium">{data.tokenCount || data.token_count || 1}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Batch ID</p>
              <p className="font-medium">{data.batchId || data.batch_id || 'N/A'}</p>
            </div>
            {data.employee && (
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <p className="text-sm text-gray-500">Assigned Employee</p>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {data.employee.image && (
                    <img 
                      src={data.employee.image} 
                      alt={data.employee.name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  )}
                  <div>
                    <p className="font-medium">{data.employee.name}</p>
                    <p className="text-sm text-gray-600">{data.employee.position}</p>
                    <p className="text-sm text-gray-600">{data.employee.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentDetailsCards;