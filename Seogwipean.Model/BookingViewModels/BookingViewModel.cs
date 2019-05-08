using System;

namespace Seogwipean.Model.BookingViewModels
{
    public class BookingViewModel
    {
        public long BookingId { get; set; }
        public string UserName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Recommender { get; set; }
        public string RoomType { get; set; }
        public int HeadCount { get; set; }
        public string Request { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? CreateDate { get; set; }
    }
}
