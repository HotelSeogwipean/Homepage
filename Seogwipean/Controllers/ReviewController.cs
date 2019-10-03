using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Seogwipean.Web.Controllers
{
    public class ReviewController : BaseController
    {
        private readonly ILogger _logger;

        public ReviewController(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<ReviewController>();
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}