using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Activities;
using Application.Core;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers;

public class ActivitiesController : BaseApiController
{


    [HttpGet] //api/activities
    public async Task<ActionResult<List<Activity>>> GetActivities()
    {
        return HandleResult(await Mediator.Send(new List.Query()));
    }

    [HttpGet("{id}")] //api/activities/id
    public async Task<IActionResult> GetActivity(Guid id)
    {
        var result = await Mediator.Send(new Details.Query { Id = id });

        return HandleResult(result);
    }

    [HttpPost] //api/activities
    public async Task<IActionResult> CreateActivity(Activity activity)
    {
        await Mediator.Send(new Create.Command { Activity = activity });
        return Ok();
    }

    [HttpPut("{id}")] //api/activities/id
    public async Task<IActionResult> EditActivity(Guid id, Activity activity)
    {
        activity.Id = id;
        return HandleResult(await Mediator.Send(new Edit.Command { Activity = activity }));
    }


    [HttpDelete("{id}")] //api/activities/id
    public async Task<IActionResult> DeleteActivity(Guid id)
    {
        return HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
    }

}