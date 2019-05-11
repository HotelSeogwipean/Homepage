using Microsoft.Extensions.Logging;
using Seogwipean.Data.Repositories.Interface;
using Seogwipean.Model.BookingViewModels;
using Seogwipean.Model.ResultModels;
using Seogwipean.Service.Interface;
using System;
using System.Collections.Generic;

namespace Seogwipean.Service.Booking
{
    public class BookingService : IBookingService
    {
        private readonly ILogger _logger;
        private IBookingRepository _bookingRepository;

        public BookingService(ILoggerFactory loggerFactory,
            IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository ?? throw new ArgumentNullException(nameof(bookingRepository));
            _logger = loggerFactory.CreateLogger<BookingService>();
        }

        public LongResult<IList<BookingViewModel>> GetBooking(BookingViewModel vm)
        {
            return _bookingRepository.GetBooking(vm);
        }

        public LongResult AddBooking(BookingViewModel vm)
        {
            return _bookingRepository.AddBooking(vm);
        }

        public LongResult<IList<Data.Models.Booking>> GetBookingList(BookingViewModel vm)
        {
            return _bookingRepository.GetBookingList(vm);
        }

        public LongResult DeleteBooking(long bookingId)
        {
            return _bookingRepository.DeleteBooking(bookingId);
        }

    }
}
