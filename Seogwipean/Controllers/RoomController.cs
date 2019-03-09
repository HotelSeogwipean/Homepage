using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Seogwipean.Web.Controllers
{
    public class RoomController : BaseController
    {
        /// <summary>
        /// Route "/Room"
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {
            return View();
        }
    }
}