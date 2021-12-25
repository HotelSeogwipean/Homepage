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
        public int KakaoId { get; set; }
        public int Search { get; set; }
        public int Percentage { get; set; }
    }

    public class CouponDBViewModel
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