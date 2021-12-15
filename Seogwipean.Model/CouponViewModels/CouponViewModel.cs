using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Model.CouponViewModels
{

    public class CouponViewModel
    {
        public int CouponId { get; set; }
        public string Phone { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime ExpireDate { get; set; }
        public int Status { get; set; }
        public string Comment { get; set; }
        public DateTime? UseDate { get; set; }
    }
}