﻿using Seogwipean.Model.BookingViewModels;
using Seogwipean.Model.ResultModels;
using System;
using System.Collections.Generic;
using System.Text;

namespace Seogwipean.Data.Repositories.Interface
{
    public interface IBookingRepository
    {
        LongResult<BookingViewModel> GetBooking(BookingViewModel vm);
        LongResult AddBooking(BookingViewModel vm);
        LongResult<IList<Models.Booking>> GetBookingList();
    }
}