using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Seogwipean.Models;
using Seogwipean.Web.Controllers;

namespace Seogwipean.Controllers
{
    public class HomeController : BaseController
    {
        private readonly ILogger _logger;

        public HomeController(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<HomeController>();
        }

        public IActionResult Index()
        {
            var _ip = Request.HttpContext.Connection.RemoteIpAddress;
            var _url = Request.Scheme + "://" + Request.Host.Value;
            var time = DateTime.Now;
            _logger.LogInformation("HOMECONTROLLER " + time + "// IP : " + _ip + " , URL : " + _url);
            //var _url = Request.HttpContext.Request.Host;
            if (_url.Contains("seogwipean.net") || _url.Contains("www.seogwipean.net") || _url.Contains("localhost"))
            {
                return Redirect("/Coupon");
            }
            return View("Intro"); 
            
        }


        [Route("/Intro")]
        public IActionResult Intro()
        {
            return View("Index");
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
            return View();
        }

        [Route("/Hotel")]
        public IActionResult Hotel()
        {
            return View();
        }

        [Route("/location")]
        public IActionResult Location()
        {
            return View();
        }

        [Route("/offers")]
        public IActionResult Offers()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
