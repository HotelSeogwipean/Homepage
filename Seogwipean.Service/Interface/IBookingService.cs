using Seogwipean.Model.BookingViewModels;
using Seogwipean.Model.ResultModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Service.Interface
{
    public interface IBookingService
    {
        LongResult<IList<BookingViewModel>> GetBooking(BookingViewModel vm);
        LongResult<BookingViewModel> AddBooking(BookingViewModel vm);
        LongResult<IList<Data.Models.Booking>> GetBookingList(BookingViewModel vm);
        LongResult DeleteBooking(long bookingId);
        bool UpdateBookingStatus(BookingViewModel vm);
        LongResult UpdateBooking(BookingViewModel vm);
    }
}