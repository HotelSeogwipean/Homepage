using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Model.ResultModels;
using Seogwipean.Model.SurfViewModels;
using Seogwipean.Service.Interface;
using Seogwipean.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Seogwipean.Web.Controllers
{
    public class SurfController : BaseController
    {
        private readonly ILogger _logger;
        private readonly ISurfService _surfService;
        private readonly IEmailService _emailService;

        public SurfController(ILoggerFactory loggerFactory,
                                        ISurfService surfService,
                                        IEmailService emailService)
        {
            _surfService = surfService ?? throw new ArgumentNullException(nameof(surfService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = loggerFactory.CreateLogger<SurfController>();
        }


        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Add()
        {
            return View();
        }

        public IActionResult Adjust(long surfId)
        {
            var data = _surfService.GetSurf(surfId);
            return View(data);
        }


        [HttpPost("/surf/add")]
        public IActionResult AddBooking(SurfViewModel vm)
        {
            if (vm == null)
            {
                return Json(new LongResult
                {
                    Result = Common.Fail,
                    Reason = "예약 내용이 없습니다."
                });
            }
            var _add = _surfService.AddSurf(vm);
            var booker = _add.Data;
            var contents = "예약자명 : " + booker.UserName +
                "\r\n연락처 : " + booker.Phone +
                "\r\n이메일 : " + booker.Email +
                "\r\n인원 수 : " + booker.HeadCount +
                 "\r\n서핑일자 : " + booker.StartDate.ToString("yyyy-MM-dd") + " " + booker.StartTime +
                "\r\n요청사항 : " + booker.Request;

            _emailService.SendEmail(new Model.EmailViewModels.CouponViewModel
            {
                Email = "hotelseogwipean@naver.com",
                Subject = "[HotelSeogwipean] " + booker.StartDate.ToString("yyyy-MM-dd") + " " + booker.StartTime + "시 에 신규 서핑 예약건이 생성되었습니다.",
                Message = contents
            });
            return Json(_add);
        }

        [HttpPost]
        public IActionResult Adjust(SurfViewModel vm)
        {
            if (vm == null)
            {
                return Json(new LongResult
                {
                    Result = Common.Fail,
                    Reason = "예약 내용이 없습니다."
                });
            }
            var _add = _surfService.UpdateSurf(vm);
            var booker = _add.Data;
            var contents = "예약자명 : " + booker.UserName +
                "\r\n연락처 : " + booker.Phone +
                "\r\n이메일 : " + booker.Email +
                "\r\n인원 수 : " + booker.HeadCount +
                "\r\n서핑일자 : " + booker.StartDate.ToString("yyyy-MM-dd") + " " + booker.StartTime +
                "\r\n요청사항 : " + booker.Request;
            _emailService.SendEmail(new Model.EmailViewModels.CouponViewModel
            {
                Email = "hotelseogwipean@naver.com",
                Subject = "[HotelSeogwipean]" + booker.UserName + " 님의 서핑 예약건이 수정되었습니다",
                Message = contents
            });
            return Json(_add);
        }

        [HttpPost("/surf/admin")]
        public IActionResult GetList(SurfViewModel vm)
        {
            var startDate = vm.StartDate;
            var _list = _surfService.GetSurfList(vm);
            if (_list != null)
            {
                return Json(_list);
            }
            return Json(new
            {
                Result = "Failed"
            });
        }

    }
}
