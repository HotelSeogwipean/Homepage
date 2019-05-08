using System;
using System.Collections.Generic;

namespace Seogwipean.Data.Models
{
    public partial class BoardComment
    {
        public long BoardCommentId { get; set; }
        public long BoardId { get; set; }
        public long MemberId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime CreateDate { get; set; }
    }
}
