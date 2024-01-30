using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Seogwipean.Web.Controllers
{
    public class RoomController : BaseController
    {
        private readonly ILogger _logger;
        public RoomController(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<RoomController>();
        }
        public IActionResult Index()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View();
        }

        public IActionResult Test()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View();
        }

        public IActionResult Test2()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View();
        }

        public IActionResult Detail()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View();
        }
    }
}