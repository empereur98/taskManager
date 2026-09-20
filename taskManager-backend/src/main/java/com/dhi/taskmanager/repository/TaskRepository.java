package com.dhi.taskmanager.repository;

import com.dhi.taskmanager.entity.Task;
import com.dhi.taskmanager.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByUserOrderByCreatedAtDesc(User user);

    Optional<Task> findByIdAndUser(Long id, User user);
}
