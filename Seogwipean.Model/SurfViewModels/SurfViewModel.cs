using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Model.SurfViewModels
{
    public class SurfViewModel
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Phone { get; set; }
        public DateTime StartDate { get; set; }
        public int StartTime { get; set; }
        public int HeadCount { get; set; }
        public string Request { get; set; }
        public int? AgeRange { get; set; }
        public string Email { get; set; }
        public int? Status { get; set; }
        public DateTime? CreateDate { get; set; }
    }
}
