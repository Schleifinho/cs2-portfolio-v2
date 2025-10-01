using CSPortfolioLib.Events;
using MassTransit;
using MessageBrokerLib.Contracts.Producers;
using Microsoft.Extensions.Logging;

namespace CSPortfolioLib.Producers;

public class PriceUpdateEventProducer(IBus bus, ILogger<PriceUpdateEventProducer> logger) : AbstractMassTransitProducer<PriceUpdateEvent>(bus, logger)
{
    
}
