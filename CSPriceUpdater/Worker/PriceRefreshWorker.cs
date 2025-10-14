using CSPriceUpdater.Options;
using CSPriceUpdater.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CSPriceUpdater.Worker;

public class PriceRefreshWorker(IServiceProvider serviceProvider, 
    ILogger<PriceRefreshWorker> logger,
    IOptions<WorkerTimerSettings> settings) : IHostedService, IDisposable
{
    private Timer? _timer;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("HourlyWorker starting...");
        _timer = new Timer(
            async void (_) => await DoWorkAsync(),
            null,
            TimeSpan.FromMinutes(settings.Value.InitialDelayMinutes),
            TimeSpan.FromMinutes(settings.Value.IntervalMinutes) 
        );

        return Task.CompletedTask;
    }

    private async Task DoWorkAsync()
    {
        try
        {
            using var scope = serviceProvider.CreateScope();
            var processor = scope.ServiceProvider.GetRequiredService<PriceRefreshService>();

            logger.LogInformation($"HourlyWorker running at {DateTime.Now}");
            await processor.RefreshAllPricesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError($"HourlyWorker error: {ex.Message}");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("HourlyWorker stopping...");
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _timer?.Dispose();
    }
}