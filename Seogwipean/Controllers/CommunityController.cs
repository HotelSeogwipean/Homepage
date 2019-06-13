using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Model.CommunityViewModels;
using Seogwipean.Service.Interface;
using Seogwipean.Util;

namespace Seogwipean.Web.Controllers
{
    public class CommunityController : BaseController
    {
        private readonly ILogger _logger;
        private readonly ICommunityService _communityService;
        private readonly IEmailService _emailService;

        public CommunityController(ILoggerFactory loggerFactory,
                                        ICommunityService communityService,
                                        IEmailService emailService)
        {
            _communityService = communityService ?? throw new ArgumentNullException(nameof(communityService));
            _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
            _logger = loggerFactory.CreateLogger<BookingController>();
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Write()
        {
            return View();
        }

        [HttpPost]
        public IActionResult GetList(CommunityViewModel vm)
        {
            if (vm.PageNo < 1) { vm.PageNo = 1; }
            if (vm.PageSize < 1) { vm.PageSize = 10; }
            var list = _communityService.GetList(vm);
            return Json(list);
        }

        [HttpPost]
        public IActionResult AddWrite(CommunityViewModel vm)
        {
            var list = _communityService.AddWrite(vm);
            if (list.Result == Common.Success) {
                var contents = $"작성자 : ${vm.UserName} \r\n연락처 : ${vm.Phone}\r\n제목 : ${vm.Title}\r\n내용 : ${vm.Contents}";
                _emailService.SendEmail(new Model.EmailViewModels.EmailViewModel
                {
                    Email = "hotelseogwipean@naver.com",
                    Subject = "[HotelSeogwipean Web] 신규 게시글 작성",
                    Message = contents
                });
            }
            return Json(list);
        }

    }
}