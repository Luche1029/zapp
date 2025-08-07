import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { PlantsComponent } from './pages/plants/plants';
import { SpeciesComponent } from './pages/species/species';
import { TasksComponent } from './pages/tasks/tasks';
import { TasksCalendarComponent} from './pages/tasks/tasks-calendar/tasks-calendar'

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'plants', component: PlantsComponent },
  { path: 'species', component: SpeciesComponent },
  { path: 'plants/:id/tasks', component: TasksComponent },
  { path: 'tasks/calendar', component: TasksCalendarComponent },
  { path: 'tasks/calendar/plant/:id', component: TasksCalendarComponent }
];
