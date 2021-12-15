﻿using System;
using System.Collections.Generic;

namespace Seogwipean.Data.Models
{
    public partial class Coupon
    {
        public int CouponId { get; set; }
        public string Phone { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime ExpireDate { get; set; }
        public int Status { get; set; }
        public string Comment { get; set; }
    }
}