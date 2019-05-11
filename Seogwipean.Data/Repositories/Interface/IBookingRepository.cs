using Seogwipean.Model.BookingViewModels;
using Seogwipean.Model.ResultModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Data.Repositories.Interface
{
    public interface IBookingRepository
    {
        LongResult<IList<BookingViewModel>> GetBooking(BookingViewModel vm);
        LongResult AddBooking(BookingViewModel vm);
        LongResult<IList<Models.Booking>> GetBookingList(BookingViewModel vm);
        LongResult DeleteBooking(long bookingId);
    }
}
