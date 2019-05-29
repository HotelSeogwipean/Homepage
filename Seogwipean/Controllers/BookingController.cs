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
        private readonly IEmailService _emailService;

        public BookingController(ILoggerFactory loggerFactory,
                                        IBookingService bookingService,
                                        IEmailService emailService)
        {
            _bookingService = bookingService ?? throw new ArgumentNullException(nameof(bookingService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = loggerFactory.CreateLogger<BookingController>();
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Booked()
        {
            return View();
        }

        public IActionResult Book()
        {
            return View();
        }

        public IActionResult Media()
        {
            return View();
        }

        [HttpGet("/booking/admin")]
        public IActionResult Admin()
        {
            return View();
        }

        [HttpPost("/booking/admin")]
        public IActionResult GetList(BookingViewModel vm)
        {
            var startDate = vm.StartDate;
            if(startDate.Year > 1 || !string.IsNullOrEmpty(vm.UserName))
            {
                vm.IsSearch = true;
            }

            var _list = _bookingService.GetBookingList(vm);
            if(_list != null)
            {
                return Json(_list);
            }
            return Json(new {
                Result = "Failed"
            });
        }

        [HttpGet("/booking/admin/edit")]
        public IActionResult AdminEdit(long bookingId)
        {
            var data = _bookingService.GetAdminBook(bookingId);
            return View("edit", data);
        }

        [HttpPost("/booking/admin/updatestatus")]
        public IActionResult UpdateStatus(BookingViewModel vm)
        {
            var result = _bookingService.UpdateBookingStatus(vm);
            return Json(result);
        }

        [HttpPost("/booking/admin/update")]
        public IActionResult UpdateBookingData(BookingViewModel vm)
        {
            var result = _bookingService.UpdateBooking(vm);
            return Json(result);
        }

        [HttpPost("/booking/admin/delete")]
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
            var booker = _add.Data;
            var contents = "예약자명 : " + booker.UserName +
                "\r\n연락처 : " + booker.Phone +
                "\r\n이메일 : " + booker.Email +
                "\r\n인원 수 : " + booker.HeadCount +
                "\r\n체크인 : " + booker.StartDate +
                "\r\n체크아웃 : " + booker.EndDate +
                "\r\n추천인 : " + booker.Recommender +
                "\r\n요청사항 : " + booker.Request;
            _emailService.SendEmail(new Model.EmailViewModels.EmailViewModel {
                Email = "hotelseogwipean@naver.com",
                Subject = "[HotelSeogwipean Web] 신규 시숙 예약",
                Message = contents
            });
            return Json(_add);
        }
    }
}