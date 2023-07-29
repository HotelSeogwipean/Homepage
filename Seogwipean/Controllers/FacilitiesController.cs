using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Seogwipean.Web.Controllers
{
    public class FacilitiesController : BaseController
    {
        private readonly ILogger _logger;

        public FacilitiesController(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<FacilitiesController>();
        }

        public IActionResult Index()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host.Value;
            var time = DateTime.Now;
            _logger.LogInformation("FacilitiesController " + time + "// IP : " + _ip + " , URL : " + _url);
            return View();
        }
    }
}