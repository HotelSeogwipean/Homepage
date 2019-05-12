using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Seogwipean.Model.EmailViewModels;
using Seogwipean.Service.Interface;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Seogwipean.Service.Email
{
    public class EmailService : IEmailService
    {
        private readonly ILogger _logger;
        private readonly IConfiguration _configuration;

        public EmailService(ILoggerFactory loggerFactory, IConfiguration configuration)
        {
            _logger = loggerFactory.CreateLogger<EmailService>();
            _configuration = configuration;
        }

        public async Task SendEmail(EmailViewModel vm)
        {
            using (var client = new SmtpClient())
            {
                var credential = new NetworkCredential
                {
                    UserName = _configuration["Email:Email"],
                    Password = _configuration["Email:Password"]
                };

                client.Credentials = credential;
                client.Host = _configuration["Email:Host"];
                client.Port = int.Parse(_configuration["Email:Port"]);
                client.EnableSsl = true;

                using (var emailMessage = new MailMessage())
                {
                    emailMessage.To.Add(new MailAddress(vm.Email));
                    emailMessage.From = new MailAddress(_configuration["Email:Email"]);
                    emailMessage.Subject = vm.Subject;
                    emailMessage.Body = vm.Message;
                    client.Send(emailMessage);
                }
            }
            await Task.CompletedTask;
        }

    }
}
