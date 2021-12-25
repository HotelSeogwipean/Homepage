using System;
using System.Collections.Generic;

namespace Seogwipean.Data.Models
{
    public partial class CouponDb
    {
        public int Id { get; set; }
        public int Percentage { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UseDate { get; set; }
        public string Writer { get; set; }
        public string Memo { get; set; }
    }
}
