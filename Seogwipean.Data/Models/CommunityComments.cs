using System;
using System.Collections.Generic;

namespace Seogwipean.Data.Models
{
    public partial class CommunityComments
    {
        public long BoardCommentId { get; set; }
        public long BoardId { get; set; }
        public string Comment { get; set; }
        public DateTime? CreateDate { get; set; }
        public DateTime? ModifyDate { get; set; }
        public string Ip { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}
