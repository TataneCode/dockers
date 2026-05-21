using FluentAssertions;
using NSubstitute;
using SampleApi.Application.Services;
using SampleApi.Domain.Models;
using SampleApi.Domain.Repositories;
using Xunit;

namespace SampleApi.Application.Tests.Services;

public sealed class PowerServiceTests
{
    [Fact]
    public async Task GetAllAsync_DelegatesToRepository()
    {
        var powerRepository = Substitute.For<IPowerRepository>();
        var expectedPowers = new List<PowerModel>
        {
            CreatePower(id: "power-1"),
            CreatePower(id: "power-2")
        };
        powerRepository.GetAllAsync(Arg.Any<CancellationToken>()).Returns(expectedPowers);

        var service = new PowerService(powerRepository);

        var result = await service.GetAllAsync();

        result.Should().BeSameAs(expectedPowers);
        _ = powerRepository.Received(1).GetAllAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsPower_WhenFound()
    {
        var powerRepository = Substitute.For<IPowerRepository>();
        var expectedPower = CreatePower(id: "power-1");
        powerRepository.GetByIdAsync("power-1", Arg.Any<CancellationToken>()).Returns(expectedPower);

        var service = new PowerService(powerRepository);

        var result = await service.GetByIdAsync("power-1");

        result.Should().Be(expectedPower);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        var powerRepository = Substitute.For<IPowerRepository>();
        powerRepository.GetByIdAsync("missing-power", Arg.Any<CancellationToken>()).Returns((PowerModel?)null);

        var service = new PowerService(powerRepository);

        var result = await service.GetByIdAsync("missing-power");

        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_GeneratesNewGuidAsId_AndDelegatesToRepository()
    {
        var powerRepository = Substitute.For<IPowerRepository>();
        var power = CreatePower(id: "original-id");
        powerRepository.CreateAsync(Arg.Any<PowerModel>(), Arg.Any<CancellationToken>()).Returns(info => info.Arg<PowerModel>());

        var service = new PowerService(powerRepository);

        var result = await service.CreateAsync(power);

        result.Id.Should().NotBeNullOrEmpty();
        result.Id.Should().NotBe(power.Id);
        Guid.TryParse(result.Id, out _).Should().BeTrue();
        _ = powerRepository.Received(1).CreateAsync(
            Arg.Is<PowerModel>(createdPower =>
                createdPower.Id == result.Id &&
                createdPower.Name == power.Name &&
                createdPower.Description == power.Description &&
                createdPower.Type == power.Type &&
                createdPower.Level == power.Level),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAsync_SetsProvidedIdOnThePowerBeforeDelegating()
    {
        var powerRepository = Substitute.For<IPowerRepository>();
        var power = CreatePower(id: "original-id");
        powerRepository.UpdateAsync(Arg.Any<PowerModel>(), Arg.Any<CancellationToken>()).Returns(info => info.Arg<PowerModel>());

        var service = new PowerService(powerRepository);

        var result = await service.UpdateAsync("updated-id", power);

        result.Should().NotBeNull();
        result!.Id.Should().Be("updated-id");
        _ = powerRepository.Received(1).UpdateAsync(
            Arg.Is<PowerModel>(updatedPower => updatedPower.Id == "updated-id"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNull_WhenThePowerDoesNotExist()
    {
        var powerRepository = Substitute.For<IPowerRepository>();
        var power = CreatePower();
        powerRepository.UpdateAsync(Arg.Any<PowerModel>(), Arg.Any<CancellationToken>()).Returns((PowerModel?)null);

        var service = new PowerService(powerRepository);

        var result = await service.UpdateAsync("missing-power", power);

        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_WhenPowerWasDeleted()
    {
        var powerRepository = Substitute.For<IPowerRepository>();
        powerRepository.DeleteAsync("power-1", Arg.Any<CancellationToken>()).Returns(true);

        var service = new PowerService(powerRepository);

        var result = await service.DeleteAsync("power-1");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenPowerDidNotExist()
    {
        var powerRepository = Substitute.For<IPowerRepository>();
        powerRepository.DeleteAsync("missing-power", Arg.Any<CancellationToken>()).Returns(false);

        var service = new PowerService(powerRepository);

        var result = await service.DeleteAsync("missing-power");

        result.Should().BeFalse();
    }

    private static PowerModel CreatePower(
        string id = "power-1",
        string name = "Flight",
        string description = "Allows the hero to fly.",
        string type = "Physical",
        int level = 10) =>
        new(id, name, description, type, level);
}
