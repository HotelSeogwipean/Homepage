using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Model.CommunityViewModels
{
    public class CommunityViewModel
    {
        public long BoardId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
        public string Title { get; set; }
        public string Contents { get; set; }
        public long? Type { get; set; }
        public short? RoomType { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime ModifyDate { get; set; }
        public bool IsLocked { get; set; }

        public int PageSize { get; set; }
        public int PageNo { get; set; }

        public short Status { get; set; }
    }

    public class CommentsViewModel
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
