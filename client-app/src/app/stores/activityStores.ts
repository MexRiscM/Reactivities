import { makeAutoObservable, runInAction } from "mobx";
import { v4 } from "uuid";
import agent from "../api/agent";
import { Activity } from "../models/activity";
import { format } from "date-fns";

export default class ActivityStore {
  activityRegistry = new Map<string, Activity>();
  selectedActivity: Activity | undefined = undefined;
  editMode = false;
  loading = false;
  loadingInitial = false;

  constructor() {
    makeAutoObservable(this);
  }

  get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => a.date!.getTime() - b.date!.getTime()
    );
  }

  get groupedActivities() {
    return Object.entries(
      this.activitiesByDate.reduce((activities, activity) => {
        const date = format(activity.date!, "dd MMM yyyy")
        activities[date] = activities[date]
          ? [...activities[date], activity]
          : [activity];
        return activities;
      }, {} as { [key: string]: Activity[] })
    );
  }

  loadActivities = async () => {
    this.setloadingInitial(true);
    try {
      const activities = await agent.Activities.list();
      activities.forEach(activity => {
        this.setActivity(activity);
    })
    this.setloadingInitial(false);
    } catch (error) {
      console.log(error);
      this.setloadingInitial(false);
    }
  };

  loadActivity = async (id: string) => {
    let activity = this.getActivity(id);
    if (activity) {
      this.selectedActivity = activity;
      return activity;
    } else {
      this.setloadingInitial(true);
      try {
        activity = await agent.Activities.details(id);
        this.setActivity(activity);
        runInAction(() => {
          this.selectedActivity = activity;
        });
        this.setloadingInitial(false);
        return activity;
      } catch (error) {
        console.log(error);
        this.setloadingInitial(false);
      }
    }
  };

  private setActivity = (activity: Activity) => {
    activity.date = new Date(activity.date!);
    this.activityRegistry.set(activity.id, activity);
  };

  private getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  };

  setloadingInitial = (state: boolean) => {
    this.loadingInitial = state;
  };

  setEditMode = (state: boolean) => {
    this.editMode = state;
  };

  setLoading = (state: boolean) => {
    this.loading = state;
  };

  createActivity = async (activity: Activity) => {
    this.setLoading(true);
    activity.id = v4();
    try {
      await agent.Activities.create(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
      });
      this.setEditMode(false);
      this.setLoading(false);
    } catch (error) {
      console.log(error);
      this.setLoading(false);
    }
  };

  updateActivity = async (activity: Activity) => {
    this.setLoading(true);
    try {
      await agent.Activities.update(activity);
      runInAction(() => {
        this.activityRegistry.set(activity.id, activity);
        this.selectedActivity = activity;
      });
      this.setEditMode(false);
      this.setLoading(false);
    } catch (error) {
      console.log(error);
      this.setLoading(false);
    }
  };

  deleteActivity = async (id: string) => {
    this.setLoading(true);
    try {
      await agent.Activities.delete(id);
      runInAction(() => {
        this.activityRegistry.delete(id);
      });
      this.setLoading(false);
    } catch (error) {
      console.log(error);
      this.setLoading(false);
    }
  };
}
