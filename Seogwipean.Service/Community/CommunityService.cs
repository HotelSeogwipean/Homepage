using Microsoft.Extensions.Logging;
using Seogwipean.Data.Repositories.Interface;
using Seogwipean.Model.BookingViewModels;
using Seogwipean.Model.CommunityViewModels;
using Seogwipean.Model.ResultModels;
using Seogwipean.Service.Interface;
using System;
using System.Collections.Generic;

namespace Seogwipean.Service.Community
{
    public class CommunityService : ICommunityService
    {
        private readonly ILogger _logger;
        private ICommunityRepository _communityRepository;
        
        public CommunityService(ILoggerFactory loggerFactory,
            ICommunityRepository communityRepository)
        {
            _communityRepository = communityRepository ?? throw new ArgumentNullException(nameof(communityRepository));
            _logger = loggerFactory.CreateLogger<CommunityService>();
        }

        public LongResult<CommunityViewModel> AddWrite(CommunityViewModel vm)
        {
            return _communityRepository.AddWrite(vm);
        }

        public LongResult<IList<Seogwipean.Data.Models.Community>> GetList(CommunityViewModel vm)
        {
            return _communityRepository.GetList(vm);
        }

    }
}
