using System;
using System.Collections.Generic;

namespace Seogwipean.Data.Models
{
    public partial class Community
    {
        public long BoardId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
        public string Title { get; set; }
        public short? RoomType { get; set; }
        public string Contents { get; set; }
        public long? Type { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime ModifyDate { get; set; }
        public bool IsLocked { get; set; }
    }
}
