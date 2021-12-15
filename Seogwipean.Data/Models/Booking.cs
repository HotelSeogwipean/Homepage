using System;
using System.Collections.Generic;

namespace Seogwipean.Data.Models
{
    public partial class Booking
    {
        public int BookingId { get; set; }
        public string UserName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Instagram { get; set; }
        public DateTime? PickupDate { get; set; }
        public TimeSpan? PickupTime { get; set; }
        public string Request { get; set; }
    }
}
