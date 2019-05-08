using System;
using System.Collections.Generic;

namespace Seogwipean.Data.Models
{
    public partial class Member
    {
        public long MemberId { get; set; }
        public string Id { get; set; }
        public string Email { get; set; }
        public string NickName { get; set; }
        public string Password { get; set; }
        public DateTime? CreateDate { get; set; }
    }
}
