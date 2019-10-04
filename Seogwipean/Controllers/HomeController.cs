using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Seogwipean.Models;
using Seogwipean.Web.Controllers;

namespace Seogwipean.Controllers
{
    public class HomeController : BaseController
    {
        public IActionResult Index()
        {
            return View("Intro");
        }
        [Route("/Intro")]
        public IActionResult Intro()
        {
            return View("Index");
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
