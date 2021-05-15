using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Util;

namespace Seogwipean.Web.Controllers
{
    public class CommunityController : BaseController
    {
        private readonly ILogger _logger;
        //private readonly ICommunityService _communityService;

        public CommunityController(ILoggerFactory loggerFactory)
        {
            //_communityService = communityService ?? throw new ArgumentNullException(nameof(communityService));
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
        /*
        [HttpPost]
        public IActionResult GetList(CommunityViewModel vm)
        {
            if (vm.PageNo < 1) { vm.PageNo = 1; }
            if (vm.PageSize < 1) { vm.PageSize = 10; }
            var list = _communityService.GetList(vm);
            return Json(list);
        }

        /// <summary>
        /// 삭제 전용
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult UpdateStatus(CommunityViewModel vm)
        {
            vm.Status = CodesName.Write_Deleted;
            vm.Password = Common.ToHashString(vm.Password);
            var result = _communityService.UpdateStatus(vm);
            return Json(result);
        }

        [HttpPost]
        public IActionResult AddWrite(CommunityViewModel vm)
        {
            var list = _communityService.AddWrite(vm);
            if (list.Result == Common.Success)
            {
                var contents = $"작성자 : ${vm.UserName} \r\n연락처 : ${vm.Phone}\r\n제목 : ${vm.Title}\r\n내용 : ${vm.Contents}";
                _emailService.SendEmail(new Model.EmailViewModels.SurfViewModel
                {
                    Email = "hotelseogwipean@naver.com",
                    Subject = "[HotelSeogwipean Web] 신규 게시글 작성",
                    Message = contents
                });
            }
            return Json(list);
        }

        [HttpPost]
        public IActionResult CheckPassword(CommunityViewModel vm)
        {
            vm.Password = Common.ToHashString(vm.Password);
            var result = _communityService.CheckPassword(vm);
            return Json(result);
        }

        [HttpPost]
        public IActionResult UpdateViewCount(long boardId)
        {
            var update = _communityService.UpdateViewCount(boardId);
            return Json(update);
        }

        [HttpPost]
        public IActionResult GetComments(long boardId)
        {
            var list = _communityService.GetCommentsList(boardId);
            return Json(list);
        }

        [HttpPost]
        public IActionResult AddComment(CommentsViewModel vm)
        {
            System.Net.IPHostEntry host = System.Net.Dns.GetHostEntry(System.Net.Dns.GetHostName());
            string ipAddr = string.Empty;
            for (int i = 0; i < host.AddressList.Length; i++)
            {
                if (host.AddressList[i].AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                {
                    ipAddr = host.AddressList[i].ToString();
                }
            }

            vm.Ip = ipAddr;
            var result = _communityService.AddComments(vm);
            return Json(result);
        }*/

    }
}