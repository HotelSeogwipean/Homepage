using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Models;
using Seogwipean.Web.Controllers;

namespace Seogwipean.Controllers
{
    public class HomeController : BaseController
    {
        private readonly ILogger _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HomeController(ILoggerFactory loggerFactory, IHttpContextAccessor httpContextAccessor)
        {
            _logger = loggerFactory.CreateLogger<HomeController>();
            _httpContextAccessor = httpContextAccessor;
        }
        public IActionResult Index()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);

            //var _url = Request.HttpContext.Request.Host;

            if (_url.Contains("seogwipean.net") || _url.Contains("www.seogwipean.net"))
            {
                return Redirect("https://www.seogwipean.com/");
            }

            if (_url == "www.hotelseogwipean.com" || _url.Contains("www."))
            {
                return RedirectPermanent("https://hotelseogwipean.com/");
            }

            return View("Intro"); 
            
        }


        [Route("/Intro")]
        public IActionResult Intro()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View("Index");
        }

        public IActionResult Robots()
        {
            return View();
        }

        [Route("/.well-known/pki-validation")]
        [Route("/.well-known/pki-validation/godaddy.html")]
        [Route("/.well-known/pki-validation/godaddy")]
        [Route("/.well-known/pki-validation/godaddy.cshtml")]
        public IActionResult Domein()
        {
            return View("GoDaddy");
        }

        [Route("/.well-known")]
        [Route("/.well-known/acme-challenge/")]
        [Route("/.well-known/acme-challenge/3tKq9j3ufevfG2jpKfzUk2LQ179g-qv6NuG10HO1lLQ")]
        public IActionResult Domein2()
        {
            return View("GoDaddy");
        }

        [Route("/naver476d95bb846c01665a5a758ec213c6fb.html")]
        public IActionResult NaverVerification()
        {
            return View("naver476d95bb846c01665a5a758ec213c6fb");
        }

        public IActionResult Privacy()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View();
        }

        [Route("/Hotel")]
        public IActionResult Hotel()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View();
        }

        [Route("/location")]
        public IActionResult Location()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View();
        }

        [Route("/offers")]
        public IActionResult Offers()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host + Request.PathBase + Request.Path + Request.QueryString;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
