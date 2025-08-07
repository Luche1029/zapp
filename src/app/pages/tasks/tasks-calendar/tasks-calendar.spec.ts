import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksCalendar } from './tasks-calendar';

describe('TasksCalendar', () => {
  let component: TasksCalendar;
  let fixture: ComponentFixture<TasksCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasksCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
