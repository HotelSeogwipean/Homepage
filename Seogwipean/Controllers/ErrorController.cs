using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.ApplicationInsights;
using Microsoft.AspNetCore.Mvc;

namespace Seogwipean.Web.Controllers
{
    [Route("error")]
    public class ErrorController : BaseController
    {
        private readonly TelemetryClient _telemetryClient;

        public ErrorController(TelemetryClient telemetryClient)
        {
            _telemetryClient = telemetryClient;
        }

        [Route("404")]
        public IActionResult PageNotFound()
        {
            string originalPath = "unknown";
            if (HttpContext.Items.ContainsKey("originalPath"))
            {
                originalPath = HttpContext.Items["originalPath"] as string;
            }
            _telemetryClient.TrackEvent("Error.PageNotFound", new Dictionary<string, string>
            {
                ["originalPath"] = originalPath
            });
            return View();
        }
    }
}