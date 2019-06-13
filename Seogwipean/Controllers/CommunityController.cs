using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Seogwipean.Web.Controllers
{
    public class CommunityController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}