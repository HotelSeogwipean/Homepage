using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Model.BookingViewModels;
using Seogwipean.Model.ResultModels;
using Seogwipean.Service.Interface;
using Seogwipean.Util;

namespace Seogwipean.Web.Controllers
{
    public class BookingController : BaseController
    {
        private readonly ILogger _logger;
        private readonly IBookingService _bookingService;

        public BookingController(ILoggerFactory loggerFactory,
                                        IBookingService bookingService)
        {
            _bookingService = bookingService ?? throw new ArgumentNullException(nameof(bookingService));
            _logger = loggerFactory.CreateLogger<BookingController>();
        }

        public IActionResult Index()
        {
            return View();
        }


        public IActionResult Book()
        {
            return View();
        }

        [HttpGet("/booking/admin")]
        public IActionResult Admin()
        {
            return View();
        }

        [HttpPost("/booking/admin")]
        public IActionResult GetList()
        {
            var _list = _bookingService.GetBookingList();
            if(_list != null)
            {
                return Json(_list);
            }
            return Json(new {
                Result = "Failed"
            });
        }

        [HttpPost]
        public IActionResult DeleteBooking(BookingViewModel vm)
        {
            var bookingId = vm.BookingId;
            var delete = _bookingService.DeleteBooking(bookingId);
            return Json(delete);
        }

        public IActionResult GetBooking(BookingViewModel vm)
        {
            var find = _bookingService.GetBooking(vm);
            return Json(find);
        }

        [HttpPost("/booking/add")]
        public IActionResult AddBooking(BookingViewModel vm)
        {
            if(vm == null)
            {
                return Json(new LongResult {
                    Result = Common.Fail,
                    Reason = "예약 내용이 없습니다."
                });
            }
            var _add = _bookingService.AddBooking(vm);
            return Json(_add);
        }
    }
}